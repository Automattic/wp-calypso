/**
 * External dependencies
 */
import { connect } from 'react-redux';
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
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { domainManagementAllRoot } from 'calypso/my-sites/domains/paths';

/**
 * Style dependencies
 */
import './options-domain-button.scss';
class OptionsDomainButton extends React.Component {
	static propTypes = {
		selectedSiteSlug: PropTypes.string,
	};

	state = {
		isOptionsMenuVisible: false,
	};

	optionsDomainButtonRef = React.createRef();

	toggleOptionsMenu = () => {
		this.setState( ( state ) => {
			return { isOptionsMenuVisible: ! state.isOptionsMenuVisible };
		} );
	};

	closeOptionsMenu = () => {
		this.setState( { isOptionsMenuVisible: false } );
	};

	trackMenuClick = ( reactEvent ) => {
		this.props.trackOptionsDomainMenuClick( reactEvent.target.pathname );
	};

	render() {
		const { translate } = this.props;

		return (
			<React.Fragment>
				<Button
					compact
					className="options-domain-button"
					onClick={ this.toggleOptionsMenu }
					ref={ this.optionsDomainButtonRef }
				>
					{ translate( 'Other domain options' ) }
					<Gridicon icon="chevron-down" />
				</Button>
				<PopoverMenu
					className="options-domain-button__popover"
					isVisible={ this.state.isOptionsMenuVisible }
					onClose={ this.closeOptionsMenu }
					context={ this.optionsDomainButtonRef.current }
					position="bottom"
				>
					<PopoverMenuItem href={ domainManagementAllRoot() } onClick={ this.trackMenuClick }>
						{ translate( 'Manage all domains' ) }
					</PopoverMenuItem>
					<PopoverMenuItem href="/new" onClick={ this.trackMenuClick }>
						{ translate( 'Add a domain to a new site' ) }
					</PopoverMenuItem>
					<PopoverMenuItem href="/domains/add" onClick={ this.trackMenuClick }>
						{ translate( 'Add a domain to a different site' ) }
					</PopoverMenuItem>
					<PopoverMenuItem href="/start/domain" onClick={ this.trackMenuClick }>
						{ translate( 'Add a domain without a site' ) }
					</PopoverMenuItem>
				</PopoverMenu>
			</React.Fragment>
		);
	}
}

const trackOptionsDomainMenuClick = ( menuUrl ) =>
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
			trackOptionsDomainMenuClick,
		};
	}
)( localize( OptionsDomainButton ) );
