import React from 'react';
import firebase from '../../firebase';
import { connect } from 'react-redux';
import { setCurrentChannel } from '../../actions';
import { Menu, Icon, Modal, Form, Input, Button } from 'semantic-ui-react';

class Channels extends React.Component {
    state = {
        user: this.props.currentUser,
        activeChannel: '',
        channels: [],
        channelName: '',
        channelDetails: '',
        channelsRef: firebase.database().ref('channels'),
        modal: false,
        firstLoad: true
    }

    componentDidMount(){
        this.addListeners();
    }

    componentWillUnmount() {
        this.removeListeners();
    }

    addListeners = () => {
        let loadedChannels = [];
        this.state.channelsRef.on('child_added', snap => {
            loadedChannels.push(snap.val());
            this.setState({ channels: loadedChannels }, () => this.setFirstChannel());
        })
    }

    removeListeners = () => {
        //ensure refs are turned off
        this.state.channelsRef.off();
    }

    setFirstChannel = () => {
        const { firstLoad, channels } = this.state;
        const firstChannel = channels[0]
        if(firstLoad && channels.length > 0) {
            this.props.setCurrentChannel(firstChannel);
            this.setActiveChannel(firstChannel);
        }
        this.setState({ firstLoad: false })
    }

    closeModal = () => this.setState({ modal: false });
    openModal = () => this.setState({ modal: true });

    handleChange = event => {
        this.setState({ [event.target.name]: event.target.value })
    }

    changeChannel = channel => {
        this.setActiveChannel(channel);
        this.props.setCurrentChannel(channel);
    }

    setActiveChannel = channel => {
        this.setState({
            activeChannel: channel.id
        })
    }

    addChannel = () => {
        const { channelsRef, channelName, channelDetails, user } = this.state;
        const key = channelsRef.push().key;
        const newChannel = {
            id: key,
            name: channelName,
            details: channelDetails,
            createdBy: {
                name: user.displayName, 
                avatar: user.photoURL
            }
        }

        channelsRef
            .child(key)
            .update(newChannel)
            .then(() => {
                this.setState({ channelName: '', channelDetails: '' });
                this.closeModal();
            })
            .catch(err => console.error(err))
    }
    
    handleSubmit = event => {
        event.preventDefault();
        if(this.isFormValid(this.state)) {
            this.addChannel();
        }
    }

    isFormValid = ({ channelName, channelDetails }) => channelName && channelDetails

    render() {
        const { channels, modal, activeChannel } = this.state;
        return (
            <React.Fragment>
                <Menu.Menu
                    style={{ paddingBottom: '2em' }}
                >
                    <Menu.Item>
                        <span>
                            <Icon name="exchange"/> CHANNELS
                        </span>
                        ({ channels.length }) <Icon name="add" onClick={this.openModal} />
                    </Menu.Item>
                    {channels.length > 0 && channels.map(channel => {
                        return (
                            <Menu.Item
                                key={channel.id}
                                onClick={() => this.changeChannel(channel)}
                                name={channel.name}
                                style={{ opacity: 0.7 }}
                                active={channel.id === activeChannel}
                            >
                                # {channel.name}
                            </Menu.Item>
                        )
                    })}
                </Menu.Menu>
                <Modal basic open={modal} onClose={this.closeModal}>
                    <Modal.Header>Add a Channel</Modal.Header>
                    <Modal.Content>
                        <Form onSubmit={this.handleSubmit}>
                            <Form.Field>
                                <Input 
                                    fluid
                                    label="Name of Channel"
                                    name="channelName"
                                    onChange={this.handleChange}
                                />
                            </Form.Field>
                            <Form.Field>
                                <Input 
                                    fluid
                                    label="Channel Details"
                                    name="channelDetails"
                                    onChange={this.handleChange}
                                />
                            </Form.Field>
                        </Form>
                    </Modal.Content>

                    <Modal.Actions>
                        <Button color="green" inverted onClick={this.handleSubmit}>
                            <Icon name="checkmark" /> Add
                        </Button>
                        <Button color="red" inverted onClick={this.closeModal}>
                            <Icon name="remove" /> Cancel
                        </Button>
                    </Modal.Actions>
                </Modal>
            </React.Fragment>
        )
    }
}

export default connect(null, { setCurrentChannel })(Channels);