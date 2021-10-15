import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button, Gridicon } from '@automattic/components';
import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import { createRef, Component, Fragment } from 'react';
import { connect } from 'react-redux';
import PopoverMenu from 'calypso/components/popover-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import { domainAddNew, domainUseMyDomain } from 'calypso/my-sites/domains/paths';
import { composeAnalytics, recordGoogleEvent } from 'calypso/state/analytics/actions';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';

import './domain-actions-button.scss';

class DomainActionsButton extends Component {
	static propTypes = {
		selectedSiteSlug: PropTypes.string,
		specificSiteActions: PropTypes.bool,
		ellipsisButton: PropTypes.bool,
	};

	static defaultProps = {
		specificSiteActions: false,
		ellipsisButton: false,
	};

	state = {
		isAddMenuVisible: false,
	};

	constructor( props ) {
		super( props );
		this.addDomainButtonRef = createRef();
	}

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
			const useYourDomainUrl = domainUseMyDomain( this.props.selectedSiteSlug );
			return (
				<Fragment>
					<PopoverMenuItem onClick={ this.clickAddDomain }>
						{ translate( 'Search for a domain' ) }
					</PopoverMenuItem>
					<PopoverMenuItem href={ useYourDomainUrl } onClick={ this.trackMenuClick }>
						{ translate( 'Use a domain I own' ) }
					</PopoverMenuItem>
				</Fragment>
			);
		}

		return (
			<Fragment>
				<PopoverMenuItem icon="plus" href="/new" onClick={ this.trackMenuClick }>
					{ translate( 'Add a domain to a new site' ) }
				</PopoverMenuItem>
				<PopoverMenuItem icon="create" href="/domains/add" onClick={ this.trackMenuClick }>
					{ translate( 'Add a domain to a different site' ) }
				</PopoverMenuItem>
				<PopoverMenuItem icon="domains" href="/start/domain" onClick={ this.trackMenuClick }>
					{ translate( 'Add a domain without a site' ) }
				</PopoverMenuItem>
			</Fragment>
		);
	};

	render() {
		const { translate } = this.props;

		let label = <Gridicon icon="ellipsis" className="domain-actions-button__ellipsis" />;
		if ( ! this.props.ellipsisButton ) {
			label = this.props.specificSiteActions
				? translate( 'Add a domain' )
				: translate( 'Other domain options' );
		}

		return (
			<Fragment>
				<Button
					primary={ this.props.specificSiteActions }
					compact
					className="domain-actions-button"
					onClick={ this.toggleAddMenu }
					ref={ this.addDomainButtonRef }
				>
					{ label }
					{ ! this.props.ellipsisButton && <Gridicon icon="chevron-down" /> }
				</Button>
				<PopoverMenu
					className="domain-actions-button__popover"
					isVisible={ this.state.isAddMenuVisible }
					onClose={ this.closeAddMenu }
					context={ this.addDomainButtonRef.current }
					position="bottom"
				>
					{ this.renderOptions() }
				</PopoverMenu>
			</Fragment>
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
)( localize( DomainActionsButton ) );
