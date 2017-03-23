/**
 * External dependencies
 */
import classNames from 'classnames';
import React from 'react';
import sample from 'lodash/sample';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Gravatar from 'components/gravatar';
import support from 'lib/url/support';

const HappinessSupport = React.createClass({
    propTypes: {
        isJetpack: React.PropTypes.bool,
        isPlaceholder: React.PropTypes.bool,
    },

    getInitialState() {
        return {
            user: sample([
                {
                    display_name: 'Spencer',
                    avatar_URL: '//gravatar.com/avatar/368dd11821ca7e9293d1707ab838f5c7',
                },
                {
                    display_name: 'Luca',
                    avatar_URL: '//gravatar.com/avatar/7f7ba3ba8305287770e0cba76d1eb3db',
                },
            ]),
        };
    },

    renderContactButton() {
        let url = support.CALYPSO_CONTACT, target = '';

        if (this.props.isJetpack) {
            url = support.JETPACK_CONTACT_SUPPORT;
            target = '_blank';
        }

        return (
            <Button href={url} target={target}>
                {this.translate('Ask a question')}
            </Button>
        );
    },

    renderGravatar() {
        return (
            <div className="happiness-support__gravatar">
                <Gravatar user={this.state.user} size={80} />
                <em className="happiness-support__gravatar-name">
                    {this.state.user.display_name}
                </em>
            </div>
        );
    },

    renderSupportButton() {
        let url = support.SUPPORT_ROOT;

        if (this.props.isJetpack) {
            url = support.JETPACK_SUPPORT;
        }

        return (
            <Button href={url} target="_blank" rel="noopener noreferrer">
                {this.translate('Search our support site')}
            </Button>
        );
    },

    render() {
        const classes = {
            'happiness-support': true,
            'is-placeholder': this.props.isPlaceholder,
        };

        return (
            <div className={classNames(classes)}>
                {this.renderGravatar()}

                <h3 className="happiness-support__heading">
                    {this.translate('Enjoy priority support from our Happiness Engineers')}
                </h3>

                <p className="happiness-support__text">
                    {this.translate(
                        '{{strong}}Need help?{{/strong}} A Happiness Engineer can answer questions about your site, your account or how to do just about anything.',
                        {
                            components: {
                                strong: <strong />,
                            },
                        }
                    )}
                </p>

                <div className="happiness-support__buttons">
                    {this.renderContactButton()}
                    {this.renderSupportButton()}
                </div>
            </div>
        );
    },
});

export default HappinessSupport;
