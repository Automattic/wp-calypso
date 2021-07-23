/**
 * External dependencies
 */
import { connect } from 'react-redux';
import page from 'page';
import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { Button } from '@automattic/components';
import PopoverMenu from 'calypso/components/popover/menu';
import PopoverMenuItem from 'calypso/components/popover/menu-item';
import Gridicon from 'calypso/components/gridicon';
import { composeAnalytics, recordGoogleEvent } from 'calypso/state/analytics/actions';
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { domainAddNew, domainUseYourDomain } from 'calypso/my-sites/domains/paths';

class AddDomainButton extends React.Component {
	static propTypes = {
		selectedSiteSlug: PropTypes.string,
		specificSiteActions: PropTypes.bool,
	};

	static defaultProps = {
		specificSiteActions: false,
	};

	state = {
		isAddMenuVisible: false,
	};

	addDomainButtonRef = React.createRef();

	clickAddDomain = () => {
		this.props.trackAddDomainClick();
		page( domainAddNew( this.props.selectedSiteSlug ) );
	};

	toggleAddMenu = () => {
		this.setState( ( state ) => {
			return { isAddMenuVisible: ! state.isAddMenuVisible };
		} );
	};

	closeAddMenu = () => {
		this.setState( { isAddMenuVisible: false } );
	};

	trackMenuClick = ( reactEvent ) => {
		this.props.trackAddDomainMenuClick( reactEvent.target.pathname );
	};

	renderOptions = () => {
		const { specificSiteActions, translate } = this.props;

		if ( specificSiteActions ) {
			const useYourDomainUrl = domainUseYourDomain( this.props.selectedSiteSlug );
			return (
				<React.Fragment>
					<PopoverMenuItem onClick={ this.clickAddDomain }>
						{ translate( 'Search for a domain' ) }
					</PopoverMenuItem>
					<PopoverMenuItem href={ useYourDomainUrl } onClick={ this.trackMenuClick }>
						{ translate( 'Use a domain I own' ) }
					</PopoverMenuItem>
				</React.Fragment>
			);
		}

		return (
			<React.Fragment>
				{ this.props.selectedSiteSlug && (
					<PopoverMenuItem onClick={ this.clickAddDomain }>
						{ translate( 'to this site' ) }
					</PopoverMenuItem>
				) }
				<PopoverMenuItem href="/new" onClick={ this.trackMenuClick }>
					{ translate( 'to a new site' ) }
				</PopoverMenuItem>
				<PopoverMenuItem href="/domains/add" onClick={ this.trackMenuClick }>
					{ translate( 'to a different site' ) }
				</PopoverMenuItem>
				<PopoverMenuItem href="/start/domain" onClick={ this.trackMenuClick }>
					{ translate( 'without a site' ) }
				</PopoverMenuItem>
			</React.Fragment>
		);
	};

	render() {
		const { translate } = this.props;

		const label = this.props.specificSiteActions
			? translate( 'Add a domain to this site' )
			: translate( 'Add a domain' );
		const className =
			'add-domain-button' + ( this.props.specificSiteActions ? '-specific-site' : '' );

		return (
			<React.Fragment>
				<Button primary compact className={ className } onClick={ this.toggleAddMenu }>
					{ label }
					<Gridicon icon="chevron-down" ref={ this.addDomainButtonRef } />
				</Button>
				<PopoverMenu
					isVisible={ this.state.isAddMenuVisible }
					onClose={ this.closeAddMenu }
					context={ this.addDomainButtonRef.current }
					position="bottom"
				>
					{ this.renderOptions() }
				</PopoverMenu>
			</React.Fragment>
		);
	}
}

const trackAddDomainClick = () =>
	composeAnalytics(
		recordGoogleEvent( 'Domain Management', 'Clicked "Add Domain" Button in List' ),
		recordTracksEvent( 'calypso_domain_management_list_add_domain_click' )
	);

const trackAddDomainMenuClick = ( menuUrl ) =>
	recordTracksEvent( 'calypso_domain_management_list_add_domain_menu_click', {
		menu_slug: menuUrl,
	} );

export default connect(
	( state ) => {
		return {
			selectedSiteSlug: getSelectedSiteSlug( state ),
		};
	},
	() => {
		return {
			trackAddDomainClick,
			trackAddDomainMenuClick,
		};
	}
)( localize( AddDomainButton ) );
