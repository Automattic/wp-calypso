/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';
import { includes } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Dialog from 'components/dialog';
import Button from 'components/button';
import SitesDropdown from 'components/sites-dropdown';
import sitesListFactory from 'lib/sites-list';

const sitesList = sitesListFactory();

class SiteSelectorModal extends Component {
	static propTypes = {
		// children: Custom content. Will be displayed above the `SitesDropdown`.
		children: PropTypes.node,
		// filter: Function to filter sites to display
		filter: PropTypes.func,
		// hide: Will be called when clicking either button. Should toggle the `isVisible` prop.
		hide: PropTypes.func.isRequired,
		// isVisible: Determines if `SiteSelectorModal` will be displayed.
		isVisible: PropTypes.bool.isRequired,
		// mainAction: Will be run upon clicking the call-for-action button. Receives `site` as argument.
		mainAction: PropTypes.func.isRequired,
		// getMainUrl: Use if the call-for-action button should be turned into an `<a>` link. Receives `site` as argument, returns a URL.
		getMainUrl: PropTypes.func,
		// mainActionLabel: Label for the call-for-action button.
		mainActionLabel: PropTypes.string.isRequired,
		// className: class name(s) to be added to the Dialog
		className: PropTypes.string,
		// from localize()
		translate: PropTypes.func.isRequired
	}

	constructor( props ) {
		super( props );

		const primarySite = sitesList.getPrimary();
		let filteredSites = sitesList.getVisible();

		if ( props.filter ) {
			filteredSites = filteredSites.filter( props.filter );
		}

		this.state = {
			site: includes( filteredSites, primarySite )
				? primarySite
				: filteredSites[ 0 ]
		};
	}

	setSite = ( slug ) => {
		const site = sitesList.getSite( slug );
		this.setState( { site } );
	}

	onClose = ( action ) => {
		if ( 'mainAction' === action ) {
			this.props.mainAction( this.state.site );
		}

		this.props.hide();
	}

	onButtonClick = () => {
		this.props.mainAction( this.state.site );
	}

	getMainLink() {
		const url = this.props.getMainUrl && this.props.getMainUrl( this.state.site );

		return url
			? <Button primary href={ url } onClick={ this.onButtonClick } >{ this.props.mainActionLabel }</Button>
			: { action: 'mainAction', label: this.props.mainActionLabel, isPrimary: true };
	}

	render() {
		const mainLink = this.getMainLink();
		const buttons = [
			{ action: 'back', label: this.props.translate( 'Back' ) },
			mainLink
		];
		const classNames = classnames( 'site-selector-modal', this.props.className );

		return (
			<Dialog className={ classNames }
				isVisible={ this.props.isVisible }
				buttons={ buttons }
				onClose={ this.onClose }>
				<div className="site-selector-modal__content">
					{ this.props.children }
				</div>
				<SitesDropdown
					onSiteSelect={ this.setSite }
					selectedSiteId={ this.state.site && this.state.site.ID }
					filter={ this.props.filter } />
			</Dialog>
		);
	}
}

export default localize( SiteSelectorModal );
