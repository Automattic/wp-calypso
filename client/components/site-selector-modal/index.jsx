/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { includes } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Dialog from 'components/dialog';
import Button from 'components/button';
import SitesDropdown from 'components/sites-dropdown';
import { getPrimarySiteId, getVisibleSites } from 'state/selectors';

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
		translate: PropTypes.func.isRequired,
		// connected props
		initialSiteId: PropTypes.number
	}

	state = {
		siteId: this.props.initialSiteId
	}

	setSite = ( siteId ) => {
		this.setState( { siteId } );
	}

	onClose = ( action ) => {
		if ( 'mainAction' === action ) {
			this.props.mainAction( this.state.siteId );
		}

		this.props.hide();
	}

	onButtonClick = () => {
		this.props.mainAction( this.state.siteId );
	}

	getMainLink() {
		const { siteId } = this.state;
		const url = this.props.getMainUrl && siteId && this.props.getMainUrl( siteId );

		if ( url ) {
			return (
				<Button
					primary
					key="mainAction"
					disabled={ ! siteId }
					href={ url }
					onClick={ this.onButtonClick } >
					{ this.props.mainActionLabel }
				</Button>
			);
		}

		return {
			key: 'mainAction',
			action: siteId && 'mainAction',
			label: this.props.mainActionLabel,
			isPrimary: true,
			disabled: ! siteId
		};
	}

	render() {
		const mainLink = this.getMainLink();
		const buttons = [
			{ key: 'back', action: 'back', label: this.props.translate( 'Back' ) },
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
					selectedSiteId={ this.state.siteId }
					filter={ this.props.filter }
					isPlaceholder={ ! this.props.initialSiteId } />
			</Dialog>
		);
	}
}

export default connect(
	( state, { filter } ) => {
		const primarySiteId = getPrimarySiteId( state );
		const visibleSites = getVisibleSites( state );

		let filteredSiteIds = visibleSites.map( ( site ) => site.ID );

		if ( filter ) {
			filteredSiteIds = filteredSiteIds.filter( filter );
		}

		return {
			initialSiteId: includes( filteredSiteIds, primarySiteId )
				? primarySiteId
				: filteredSiteIds[ 0 ]
		};
	}
)( localize( SiteSelectorModal ) );
