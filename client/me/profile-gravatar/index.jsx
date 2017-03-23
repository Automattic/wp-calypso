/**
 * External dependencies
 */
import React from 'react';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import Animate from 'components/animate';
import Gravatar from 'components/gravatar';
import eventRecorder from 'me/event-recorder';

const debug = debugFactory('calypso:me:sidebar-gravatar');

export default React.createClass({
    displayName: 'ProfileGravatar',

    mixins: [eventRecorder],

    componentDidMount() {
        debug('The ProfileGravatar component is mounted.');
    },

    render() {
        const profileURL = `//gravatar.com/${this.props.user.username}`;

        return (
            <div className="profile-gravatar">
                <Animate type="appear">
                    <a
                        href="https://secure.gravatar.com/site/wpcom?wpcc-no-close"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="profile-gravatar__edit"
                        onClick={this.recordClickEvent('Gravatar Update Profile Photo in Sidebar')}
                    >

                        <Gravatar user={this.props.user} size={150} imgSize={400} />

                        <span className="profile-gravatar__edit-label-wrap">
                            <span className="profile-gravatar__edit-label">
                                {this.translate('Update Profile Photo')}
                            </span>
                        </span>
                    </a>
                </Animate>
                <h2 className="profile-gravatar__user-display-name">
                    {this.props.user.display_name}
                </h2>
                <div className="profile-gravatar__user-secondary-info">
                    <a href={profileURL} target="_blank" rel="noopener noreferrer">
                        @{this.props.user.username}
                    </a>
                </div>
            </div>
        );
    },
});
