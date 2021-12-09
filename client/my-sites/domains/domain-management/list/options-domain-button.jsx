/* eslint-disable wpcalypso/jsx-classname-namespace */

import { recordTracksEvent } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import { Button, Gridicon } from '@automattic/components';
import { Icon, moreVertical, plus, search } from '@wordpress/icons';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import { createRef, Component, Fragment } from 'react';
import { connect } from 'react-redux';
import PopoverMenu from 'calypso/components/popover-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import {
	domainAddNew,
	domainManagementAllRoot,
	domainUseMyDomain,
} from 'calypso/my-sites/domains/paths';
import { composeAnalytics, recordGoogleEvent } from 'calypso/state/analytics/actions';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';

import './options-domain-button.scss';
class AddDomainButton extends Component {
	static propTypes = {
		selectedSiteSlug: PropTypes.string,
		specificSiteActions: PropTypes.bool,
		ellipsisButton: PropTypes.bool,
		borderless: PropTypes.bool,
	};

	static defaultProps = {
		specificSiteActions: false,
		ellipsisButton: false,
		borderless: false,
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
						<Icon icon={ search } size={ 18 } className="gridicon" viewBox="2 2 20 20" />
						{ translate( 'Search for a domain' ) }
					</PopoverMenuItem>
					<PopoverMenuItem icon="domains" href={ useYourDomainUrl } onClick={ this.trackMenuClick }>
						{ translate( 'Use a domain I own' ) }
					</PopoverMenuItem>
				</Fragment>
			);
		}

		return (
			<Fragment>
				{ ! config.isEnabled( 'domains/management-list-redesign' ) && (
					<PopoverMenuItem href={ domainManagementAllRoot() } onClick={ this.trackMenuClick }>
						{ translate( 'Manage all domains' ) }
					</PopoverMenuItem>
				) }
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

	renderLabel() {
		const { ellipsisButton, specificSiteActions, translate } = this.props;
		const isRedesign = config.isEnabled( 'domains/management-list-redesign' );

		if ( ellipsisButton ) {
			return <Icon icon={ moreVertical } className="options-domain-button__ellipsis gridicon" />;
		}

		let label = translate( 'Other domain options' );
		if ( specificSiteActions ) {
			label = isRedesign ? translate( 'Add a domain' ) : translate( 'Add a domain to this site' );
		}

		if ( isRedesign ) {
			return (
				<>
					<Icon icon={ plus } className="options-domain-button__add gridicon" viewBox="2 2 20 20" />
					<span className="options-domain-button__desktop">{ label }</span>
				</>
			);
		}

		return (
			<>
				{ label }
				{ <Gridicon icon="chevron-down" /> }
			</>
		);
	}

	render() {
		const { specificSiteActions, ellipsisButton, borderless } = this.props;
		const classes = classNames( 'options-domain-button', ellipsisButton && 'ellipsis' );

		return (
			<Fragment>
				<Button
					primary={ specificSiteActions }
					className={ classes }
					onClick={ this.toggleAddMenu }
					ref={ this.addDomainButtonRef }
					borderless={ borderless }
				>
					{ this.renderLabel() }
				</Button>
				<PopoverMenu
					className="options-domain-button__popover"
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
)( localize( AddDomainButton ) );
