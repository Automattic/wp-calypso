/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Button from 'components/button';
import Dialog from 'components/dialog';
import Gridicon from 'components/gridicon';
import Notice from 'components/notice';
import {
	getStatus,
	isApiReady,
	isShowingUnblockInstructions,
	isEnabled,
} from 'state/push-notifications/selectors';
import {
	toggleEnabled,
	toggleUnblockInstructions
} from 'state/push-notifications/actions';

const PushNotificationSettings = React.createClass( {
	displayName: 'PushNotificationSettings',

	propTypes: {
		toggleEnabled: React.PropTypes.func.isRequired,
		toggleUnblockInstructions: React.PropTypes.func.isRequired
	},

	clickHandler: function() {
		this.props.toggleEnabled();
	},

	getBlockedInstruction: function() {
		const svgAddressBar = '<svg width="206px" height="206px" viewBox="0 0 206 206" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><!-- Generator: Sketch 3.7.2 (28276) - http://www.bohemiancoding.com/sketch --><title>address-bar</title><desc>Created with Sketch.</desc><defs><circle id="path-1" cx="99" cy="99" r="99"></circle><mask id="mask-2" maskContentUnits="userSpaceOnUse" maskUnits="objectBoundingBox" x="-4" y="-4" width="206" height="206"><rect x="-4" y="-4" width="206" height="206" fill="white"></rect><use xlink:href="#path-1" fill="black"></use></mask><circle id="path-3" cx="99" cy="99" r="99"></circle><rect id="path-5" x="0" y="0" width="488" height="361" rx="4"></rect><mask id="mask-6" maskContentUnits="userSpaceOnUse" maskUnits="objectBoundingBox" x="-4" y="-4" width="496" height="369"><rect x="-4" y="-4" width="496" height="369" fill="white"></rect><use xlink:href="#path-5" fill="black"></use></mask><rect id="path-7" x="93" y="6" width="334" height="28" rx="4"></rect><mask id="mask-8" maskContentUnits="userSpaceOnUse" maskUnits="objectBoundingBox" x="-1" y="-1" width="336" height="30"><rect x="92" y="5" width="336" height="30" fill="white"></rect><use xlink:href="#path-7" fill="black"></use></mask><path d="M97.25,40 L71.0028524,40 C69.3442117,40 68,41.3470833 68,43.0087948 L68,340.991205 C68,342.661303 69.3444228,344 71.0028524,344 L451.997148,344 C453.655788,344 455,342.652917 455,340.991205 L455,43.0087948 C455,41.3386965 453.655577,40 451.997148,40 L121.75,40 L109.5,28 L97.25,40 Z" id="path-9"></path><filter x="-50%" y="-50%" width="200%" height="200%" filterUnits="objectBoundingBox" id="filter-10"><feMorphology radius="1" operator="dilate" in="SourceAlpha" result="shadowSpreadOuter1"></feMorphology><feOffset dx="0" dy="4" in="shadowSpreadOuter1" result="shadowOffsetOuter1"></feOffset><feGaussianBlur stdDeviation="8" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur><feComposite in="shadowBlurOuter1" in2="SourceAlpha" operator="out" result="shadowBlurOuter1"></feComposite><feColorMatrix values="0 0 0 0 0.180392157   0 0 0 0 0.266666667   0 0 0 0 0.325490196  0 0 0 0.3 0" type="matrix" in="shadowBlurOuter1"></feColorMatrix></filter><mask id="mask-11" maskContentUnits="userSpaceOnUse" maskUnits="objectBoundingBox" x="-1" y="-1" width="389" height="318"><rect x="67" y="27" width="389" height="318" fill="white"></rect><use xlink:href="#path-9" fill="black"></use></mask></defs><g id="Enable-Notifications" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g id="address-bar"><g id="Group-15-Copy" transform="translate(4.000000, 4.000000)"><g id="Oval-2"><use fill="#F3F6F8" fill-rule="evenodd" xlink:href="#path-1"></use><use stroke="#C8D7E1" mask="url(#mask-2)" stroke-width="8" xlink:href="#path-1"></use></g><g id="Group-11-Copy"><mask id="mask-4" fill="white"><use xlink:href="#path-3"></use></mask><g id="Mask"></g><g mask="url(#mask-4)"><g transform="translate(10.000000, 42.000000)"><g id="Rectangle-64" fill="none"><use fill="#FFFFFF" fill-rule="evenodd" xlink:href="#path-5"></use><use stroke="#E9EFF3" mask="url(#mask-6)" stroke-width="8" xlink:href="#path-5"></use></g><rect id="Rectangle-64-Copy" fill="#F3F6F8" fill-rule="evenodd" x="0" y="0" width="488" height="40" rx="4"></rect><g id="Rectangle-69" fill="none"><use fill="#FFFFFF" fill-rule="evenodd" xlink:href="#path-7"></use><use stroke="#E9EFF3" mask="url(#mask-8)" stroke-width="2" xlink:href="#path-7"></use></g><text id="https://wordpress.co" fill="none" font-family="SFUIText-Regular, SF UI Text" font-size="13" font-weight="normal"><tspan x="122.245605" y="24" fill="#C8D7E1">https://wordpress.com</tspan></text><rect id="Rectangle-66" fill="#E9EFF3" fill-rule="evenodd" x="0" y="40" width="488" height="4"></rect><g id="Group" stroke-width="1" fill="none" fill-rule="evenodd" transform="translate(13.000000, 8.000000)"><rect id="Rectangle-path" x="0" y="0" width="24" height="24"></rect><polygon id="Shape" fill="#C8D7E1" points="20 11 7.83 11 13.42 5.41 12 4 4 12 12 20 13.41 18.59 7.83 13 20 13"></polygon></g><g id="Group" stroke-width="1" fill="none" fill-rule="evenodd" transform="translate(53.000000, 8.000000)"><rect id="Rectangle-path" x="0" y="0" width="24" height="24"></rect><polygon id="Shape" fill="#C8D7E1" points="12 4 10.59 5.41 16.17 11 4 11 4 13 16.17 13 10.59 18.59 12 20 20 12"></polygon></g><g id="Group" stroke-width="1" fill="none" fill-rule="evenodd" transform="translate(101.000000, 11.000000)"><rect id="Rectangle-path" x="0" y="0" width="16" height="16"></rect><path d="M12,5.33333333 L11.3333333,5.33333333 L11.3333333,4.66666667 C11.3333333,2.82866667 9.838,1.33333333 8,1.33333333 C6.162,1.33333333 4.66666667,2.82866667 4.66666667,4.66666667 L4.66666667,5.33333333 L4,5.33333333 C3.26333333,5.33333333 2.66666667,5.93 2.66666667,6.66666667 L2.66666667,13.3333333 C2.66666667,14.07 3.26333333,14.6666667 4,14.6666667 L12,14.6666667 C12.7366667,14.6666667 13.3333333,14.07 13.3333333,13.3333333 L13.3333333,6.66666667 C13.3333333,5.93 12.7366667,5.33333333 12,5.33333333 L12,5.33333333 Z M6,4.66666667 C6,3.564 6.89733333,2.66666667 8,2.66666667 C9.10266667,2.66666667 10,3.564 10,4.66666667 L10,5.33333333 L6,5.33333333 L6,4.66666667 L6,4.66666667 Z M8.66666667,10.482 L8.66666667,12 L7.33333333,12 L7.33333333,10.482 C6.93666667,10.2513333 6.66666667,9.826 6.66666667,9.33333333 C6.66666667,8.59666667 7.26333333,8 8,8 C8.73666667,8 9.33333333,8.59666667 9.33333333,9.33333333 C9.33333333,9.82533333 9.06333333,10.2506667 8.66666667,10.482 L8.66666667,10.482 Z" id="Shape" fill="#A8BECE"></path></g><g id="Combined-Shape" fill="none"><use fill="black" fill-opacity="1" filter="url(#filter-10)" xlink:href="#path-9"></use><use fill="#FFFFFF" fill-rule="evenodd" xlink:href="#path-9"></use><use stroke="#C8D7E1" mask="url(#mask-11)" stroke-width="2" xlink:href="#path-9"></use></g><rect id="Rectangle-70" fill="#C8D7E1" fill-rule="evenodd" x="83" y="55" width="161" height="18"></rect><rect id="Rectangle-70-Copy-2" fill="#C8D7E1" fill-rule="evenodd" x="83" y="113" width="151" height="14"></rect><rect id="Rectangle-70-Copy-3" fill="#E9EFF3" fill-rule="evenodd" x="113" y="143" width="151" height="14"></rect><rect id="Rectangle-70-Copy" fill="#E9EFF3" fill-rule="evenodd" x="83" y="77" width="121" height="14"></rect></g></g></g></g></g></g></svg>';
		const svgAlwaysAllow = '<svg width="206px" height="206px" viewBox="0 0 206 206" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><!-- Generator: Sketch 3.7.2 (28276) - http://www.bohemiancoding.com/sketch --><title>always-allow</title><desc>Created with Sketch.</desc><defs><circle id="path-1" cx="99" cy="99" r="99"></circle><mask id="mask-2" maskContentUnits="userSpaceOnUse" maskUnits="objectBoundingBox" x="-4" y="-4" width="206" height="206"><rect x="-4" y="-4" width="206" height="206" fill="white"></rect><use xlink:href="#path-1" fill="black"></use></mask><circle id="path-3" cx="99" cy="99" r="99"></circle><rect id="path-5" x="0" y="0" width="392" height="290" rx="4"></rect><mask id="mask-6" maskContentUnits="userSpaceOnUse" maskUnits="objectBoundingBox" x="-4" y="-4" width="400" height="298"><rect x="-4" y="-4" width="400" height="298" fill="white"></rect><use xlink:href="#path-5" fill="black"></use></mask><path d="M78.505814,31.6455696 L58.0031305,31.6455696 C56.3525752,31.6455696 55,32.9893356 55,34.6469549 L55,272.998615 C55,274.655708 56.3445473,276 58.0031305,276 L362.99687,276 C364.647425,276 366,274.656234 366,272.998615 L366,34.6469549 C366,32.9898616 364.655453,31.6455696 362.99687,31.6455696 L98.1944444,31.6455696 L88.3501292,22 L78.505814,31.6455696 Z" id="path-7"></path><filter x="-50%" y="-50%" width="200%" height="200%" filterUnits="objectBoundingBox" id="filter-8"><feMorphology radius="1" operator="dilate" in="SourceAlpha" result="shadowSpreadOuter1"></feMorphology><feOffset dx="0" dy="4" in="shadowSpreadOuter1" result="shadowOffsetOuter1"></feOffset><feGaussianBlur stdDeviation="8" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur><feComposite in="shadowBlurOuter1" in2="SourceAlpha" operator="out" result="shadowBlurOuter1"></feComposite><feColorMatrix values="0 0 0 0 0.180392157   0 0 0 0 0.266666667   0 0 0 0 0.325490196  0 0 0 0.3 0" type="matrix" in="shadowBlurOuter1"></feColorMatrix></filter><mask id="mask-9" maskContentUnits="userSpaceOnUse" maskUnits="objectBoundingBox" x="-1" y="-1" width="313" height="256"><rect x="54" y="21" width="313" height="256" fill="white"></rect><use xlink:href="#path-7" fill="black"></use></mask><rect id="path-10" x="0" y="0" width="153" height="55" rx="4"></rect><filter x="-50%" y="-50%" width="200%" height="200%" filterUnits="objectBoundingBox" id="filter-11"><feOffset dx="0" dy="2" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset><feGaussianBlur stdDeviation="7" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur><feComposite in="shadowBlurOuter1" in2="SourceAlpha" operator="out" result="shadowBlurOuter1"></feComposite><feColorMatrix values="0 0 0 0 0.180392157   0 0 0 0 0.266666667   0 0 0 0 0.325490196  0 0 0 0.2 0" type="matrix" in="shadowBlurOuter1"></feColorMatrix></filter><mask id="mask-12" maskContentUnits="userSpaceOnUse" maskUnits="objectBoundingBox" x="0" y="0" width="153" height="55" fill="white"><use xlink:href="#path-10"></use></mask></defs><g id="Enable-Notifications" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g id="always-allow"><g id="Group-14-Copy" transform="translate(4.000000, 4.000000)"><g id="Oval-2-Copy"><use fill="#F3F6F8" fill-rule="evenodd" xlink:href="#path-1"></use><use stroke="#C8D7E1" mask="url(#mask-2)" stroke-width="8" xlink:href="#path-1"></use></g><g id="Group-13"><mask id="mask-4" fill="white"><use xlink:href="#path-3"></use></mask><use id="Mask" fill="#F3F6F8" xlink:href="#path-3"></use><g mask="url(#mask-4)"><g transform="translate(-39.000000, -46.000000)"><g id="Rectangle-64" fill="none"><use fill="#FFFFFF" fill-rule="evenodd" xlink:href="#path-5"></use><use stroke="#E9EFF3" mask="url(#mask-6)" stroke-width="8" xlink:href="#path-5"></use></g><g id="Combined-Shape" fill="none"><use fill="black" fill-opacity="1" filter="url(#filter-8)" xlink:href="#path-7"></use><use fill="#FFFFFF" fill-rule="evenodd" xlink:href="#path-7"></use><use stroke="#C8D7E1" mask="url(#mask-9)" stroke-width="2" xlink:href="#path-7"></use></g><rect id="Rectangle-70" fill="#C8D7E1" fill-rule="evenodd" x="67" y="44" width="129" height="14"></rect><rect id="Rectangle-70-Copy-2" fill="#C8D7E1" fill-rule="evenodd" x="67" y="91" width="121" height="11"></rect><rect id="Rectangle-70-Copy-3" fill="#E9EFF3" fill-rule="evenodd" x="91" y="115" width="121" height="11"></rect><rect id="Rectangle-70-Copy-5" fill="#E9EFF3" fill-rule="evenodd" x="91" y="163" width="121" height="11"></rect><rect id="Rectangle-70-Copy-6" fill="#E9EFF3" fill-rule="evenodd" x="91" y="187" width="121" height="11"></rect><rect id="Rectangle-70-Copy" fill="#E9EFF3" fill-rule="evenodd" x="67" y="62" width="97" height="11"></rect><text id="Notifications:-Ask-b" fill="none" font-family="SFUIText-Regular, SF UI Text" font-size="10.442623" font-weight="normal"><tspan x="91" y="148" fill="#3D596D">Notifications: Ask by default</tspan></text><g id="Group-12" stroke-width="1" fill="none" fill-rule="evenodd" transform="translate(236.000000, 139.000000)"><polyline id="Shape" fill="#C8D7E1" points="0 2.86363636 3 0 6 2.86363636 5.46975 3.36978409 3 1.01229545 0.53025 3.36978409"></polyline><polyline id="Shape" fill="#C8D7E1" points="6 5.87546591 3 8.73910227 0 5.87546591 0.53025 5.36931818 3 7.72680682 5.46975 5.36931818"></polyline></g><polygon id="Path-24" fill="#C8D7E1" fill-rule="evenodd" points="67.8235294 139 80.1764706 139 81 139.8 81 147 80.1764706 147.8 73.5882353 147.8 70.2941176 151 70.2941176 147 67.8235294 147 67 146.2 67 139.8"></polygon><g id="Group-11" stroke-width="1" fill="none" fill-rule="evenodd" transform="translate(158.000000, 124.000000)"><g id="Rectangle-88"><use fill="black" fill-opacity="1" filter="url(#filter-11)" xlink:href="#path-10"></use><use stroke="#C8D7E1" mask="url(#mask-12)" stroke-width="2" fill="#F3F6F8" fill-rule="evenodd" xlink:href="#path-10"></use></g><text id="Always-allow-on-this" font-family="SFUIText-Regular, SF UI Text" font-size="9.56521739" font-weight="normal" fill="#3D596D"><tspan x="26.434555" y="20.1594203">Always allow on this site</tspan></text><rect id="Rectangle-89" fill="#C8D7E1" opacity="0.5" x="26.434555" y="32.6811594" width="98.5287958" height="11.1594203"></rect></g><polyline id="Shape" fill="#2E4453" fill-rule="evenodd" points="171.109251 144 168 140.675235 168.655506 139.974294 171.109251 142.598116 176.344494 137 177 137.700942"></polyline></g></g></g></g></g></g></svg>';

		return (
			<Dialog isVisible={ this.props.showDialog } className=".notification-settings-push-notification-settings__instruction-dialog" onClose={ this.props.toggleUnblockInstructions }>
				<div className="notification-settings-push-notification-settings__instruction-content">
					<div>
						<div className="notification-settings-push-notification-settings__instruction-title">{ this.translate( 'Enable Browser Notifications' ) }</div>
						<div className="notification-settings-push-notification-settings__instruction-step">
							{ /*eslint-disable react/no-danger*/ }
							<div className="notification-settings-push-notification-settings__instruction-image" dangerouslySetInnerHTML={ { __html: svgAddressBar } } />
							<p>{ this.translate( 'Click the lock icon in your address bar.' ) }</p>
						</div>
						<div className="notification-settings-push-notification-settings__instruction-step">
							{ /*eslint-disable react/no-danger*/ }
							<div className="notification-settings-push-notification-settings__instruction-image" dangerouslySetInnerHTML={ { __html: svgAlwaysAllow } } />
							<p>{ this.translate(
								'Click {{strong}}Notifications{{/strong}} and choose {{em}}Always allow{{/em}}.', {
									components: {
										strong: <strong />,
										em: <em />
									} }
							) }</p>
						</div>
					</div>
				</div>
				<span tabIndex="0" className="notification-settings-push-notification-settings__instruction-dismiss" onClick={ this.props.toggleUnblockInstructions } >
					<Gridicon icon="cross" size={ 24 } />
					<span className="screen-reader-text">{ this.translate( 'Dismiss' ) }</span>
				</span>
			</Dialog>
		);
	},

	render: function() {
		let blockedInstruction,
			buttonClass,
			buttonDisabled,
			buttonText,
			deniedText,
			stateClass,
			stateText;

		if ( ! this.props.apiReady ) {
			return null;
		}

		switch ( this.props.status ) {
			case 'disabling':
				buttonClass = { 'is-enable': true };
				buttonDisabled = true;
				buttonText = this.translate( 'Enable' );
				stateClass = { 'is-disabled': true };
				stateText = this.translate( 'Disabled' );
				break;
			case 'enabling':
				buttonClass = { 'is-disable': true };
				buttonDisabled = true;
				buttonText = this.translate( 'Disable' );
				stateClass = { 'is-enabled': true };
				stateText = this.translate( 'Enabled' );
				break;
			case 'unsubscribed':
				buttonClass = { 'is-enable': true };
				buttonDisabled = false;
				buttonText = this.translate( 'Enable' );
				stateClass = { 'is-disabled': true };
				stateText = this.translate( 'Disabled' );
				break;
			case 'subscribed':
				buttonClass = { 'is-disable': true };
				buttonDisabled = false;
				buttonText = this.translate( 'Disable' );
				stateClass = { 'is-enabled': true };
				stateText = this.translate( 'Enabled' );
				break;
			case 'denied':
				blockedInstruction = this.getBlockedInstruction();
				buttonClass = { 'is-enable': true };
				buttonDisabled = true;
				buttonText = this.translate( 'Enable' );
				stateClass = { 'is-disabled': true };
				stateText = this.translate( 'Disabled' );

				deniedText = <Notice className="notification-settings-push-notification-settings__instruction" showDismiss={ false } text={
					<div>
						<div>{ this.translate( 'Your browser is currently set to block notifications from WordPress.com.' ) }</div>
						<div>{ this.translate(
							'{{instructionsButton}}View Instructions to Enable{{/instructionsButton}}', {
								components: {
									instructionsButton: <Button className={ 'is-link' } onClick={ this.props.toggleUnblockInstructions } />
								} }
						) }</div>
						{ blockedInstruction }
					</div>
				} />;
				break;

			default:
				return null;
		}

		return (
			<Card className="notification-settings-push-notification-settings__settings">
				<h2 className="notification-settings-push-notification-settings__settings-heading">
					<Gridicon size={ 24 } className="notification-settings-push-notification-settings__settings-icon" icon="bell" />
					{ this.translate( 'Browser Notifications' ) }
					<small className={ classNames( 'notification-settings-push-notification-settings__settings-state', stateClass ) }>{ stateText }</small>
				</h2>

				<p className="notification-settings-push-notification-settings__settings-description">{ this.translate( 'Get notifications for new comments, likes, and more instantly, even when your browser is closed.' ) }</p>

				<Button className={ classNames( 'notification-settings-push-notification-settings__settings-button', buttonClass ) } disabled={ buttonDisabled } onClick={ this.clickHandler } >{ buttonText }</Button>

				{ deniedText }
			</Card>
	);
	}
} );

export default connect(
	( state ) => {
		return {
			apiReady: isApiReady( state ),
			isEnabled: isEnabled( state ),
			showDialog: isShowingUnblockInstructions( state ),
			status: getStatus( state )
		};
	},
	{
		toggleEnabled,
		toggleUnblockInstructions
	}
)( PushNotificationSettings );
