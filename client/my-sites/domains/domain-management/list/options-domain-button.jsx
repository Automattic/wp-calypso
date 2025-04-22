/* eslint-disable wpcalypso/jsx-classname-namespace */

import { recordTracksEvent } from '@automattic/calypso-analytics';
import page from '@automattic/calypso-router';
import { withMobileBreakpoint } from '@automattic/viewport-react';
import { Icon, search } from '@wordpress/icons';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import SplitButton from 'calypso/components/split-button';
import { domainUseMyDomain } from 'calypso/my-sites/domains/paths';
import { composeAnalytics, recordGoogleEvent } from 'calypso/state/analytics/actions';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';

import './options-domain-button.scss';

class AddDomainButton extends Component {
	static propTypes = {
		selectedSiteSlug: PropTypes.string,
		allDomainsList: PropTypes.bool,
		sidebarMode: PropTypes.bool,
	};

	static defaultProps = {
		allDomainsList: false,
		sidebarMode: false,
	};

	constructor( props ) {
		super( props );
	}

	clickAddDomain = () => {
		this.props.trackAddDomainClick();
		page( '/start/domain' );
	};

	trackMenuClick = ( reactEvent ) => {
		this.props.trackAddDomainMenuClick( reactEvent.target.pathname );
	};

	renderOptions = () => {
		const { allDomainsList, translate } = this.props;

		if ( allDomainsList ) {
			return (
				<Fragment>
					<PopoverMenuItem icon="domains" href="/start/domain" onClick={ this.trackMenuClick }>
						{ translate( 'Register a new domain' ) }
					</PopoverMenuItem>
					<PopoverMenuItem
						icon="domains"
						href="/setup/domain-transfer"
						onClick={ this.trackMenuClick }
					>
						{ translate( 'Transfer domains' ) }
					</PopoverMenuItem>
				</Fragment>
			);
		}

		const useYourDomainUrl = domainUseMyDomain( this.props.selectedSiteSlug );
		return (
			<Fragment>
				<PopoverMenuItem onClick={ this.clickAddDomain }>
					<Icon icon={ search } size={ 18 } className="gridicon" viewBox="2 2 20 20" />
					{ translate( 'Search for a domain' ) }
				</PopoverMenuItem>
				<PopoverMenuItem icon="domains" href={ useYourDomainUrl } onClick={ this.trackMenuClick }>
					{ translate( 'Use a domain I own' ) }
				</PopoverMenuItem>
			</Fragment>
		);
	};

	render() {
		const { isBreakpointActive, translate } = this.props;

		return (
			<SplitButton
				className="options-domain-button"
				primary={ ! this.props.sidebarMode }
				whiteSeparator={ ! this.props.sidebarMode }
				label={ isBreakpointActive ? undefined : translate( 'Add new domain' ) }
				toggleIcon={ isBreakpointActive ? 'plus' : undefined }
				href="/start/domain"
				onClick={ this.trackAddDomainClick }
			>
				{ this.renderOptions() }
			</SplitButton>
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
)( localize( withMobileBreakpoint( AddDomainButton ) ) );
