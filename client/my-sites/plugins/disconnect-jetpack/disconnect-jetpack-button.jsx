/**
 * External dependencies
 */
import React from 'react';
import assign from 'lodash/object/assign';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import DisconnectJetpackDialog from 'my-sites/plugins/disconnect-jetpack/disconnect-jetpack-dialog';
import analytics from 'analytics';

export default React.createClass( {

	displayName: 'DisconnectJetpackButton',

	propTypes: {
		site: React.PropTypes.object.isRequired,
		redirect: React.PropTypes.string.isRequired,
		disabled: React.PropTypes.bool,
		linkDisplay: React.PropTypes.bool,
		isMock: React.PropTypes.bool,
		text: React.PropTypes.string
	},

	getDefaultProps() {
		return {
			linkDisplay: true
		};
	},

	render() {
		const { site, redirect, linkDisplay } = this.props;
		const buttonElement = linkDisplay ? 'button' : Button;

		const buttonClasses = classNames( {
			button: true,
			'disconnect-jetpack-button': true,
			'is-link': linkDisplay
		} );

		const buttonProps = assign( {}, this.props, {
			id: `disconnect-jetpack-${ site.ID }`,
			className: buttonClasses,
			compact: true,
			disabled: this.props.disabled,
			scary: true,
			onClick: ( event ) => {
				event.preventDefault();
				if ( this.props.isMock ) {
					return;
				}
				this.refs.dialog.open();
				analytics.ga.recordEvent( 'Jetpack', 'Clicked To Open Disconnect Jetpack Dialog' );
			}
		} );

		let { text } = this.props;
		let buttonChildren;

		if ( ! text ) {
			text = this.translate( 'Disconnect', {
				context: 'Jetpack: Action user takes to disconnect Jetpack site from .com'
			} );
		}

		buttonChildren = (
			<div>
				{ text }
				<DisconnectJetpackDialog site={ site } ref="dialog" redirect={ redirect } />
			</div>
		);

		return React.createElement( buttonElement, buttonProps, buttonChildren );
	}
} );
