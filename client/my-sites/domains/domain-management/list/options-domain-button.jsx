/* eslint-disable wpcalypso/jsx-classname-namespace */

import { recordTracksEvent } from '@automattic/calypso-analytics';
import page from '@automattic/calypso-router';
import { withMobileBreakpoint } from '@automattic/viewport-react';
import { compose } from '@wordpress/compose';
import { Icon, plus, search } from '@wordpress/icons';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { createRef, Component, Fragment } from 'react';
import { connect } from 'react-redux';
import EllipsisMenu from 'calypso/components/ellipsis-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import SplitButton from 'calypso/components/split-button';
import { domainAddNew, domainUseMyDomain } from 'calypso/my-sites/domains/paths';
import { composeAnalytics, recordGoogleEvent } from 'calypso/state/analytics/actions';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';

import './options-domain-button.scss';

class AddDomainButton extends Component {
	static propTypes = {
		selectedSiteSlug: PropTypes.string,
		specificSiteActions: PropTypes.bool,
		ellipsisButton: PropTypes.bool,
		allDomainsList: PropTypes.bool,
	};

	static defaultProps = {
		specificSiteActions: false,
		ellipsisButton: false,
		allDomainsList: false,
	};

	constructor( props ) {
		super( props );
		this.addDomainButtonRef = createRef();
	}

	getAddNewDomainUrl = () => {
		if ( ! this.props.selectedSiteSlug ) {
			return '/start/domain';
		}

		return domainAddNew( this.props.selectedSiteSlug );
	};

	clickAddDomain = () => {
		this.props.trackAddDomainClick();
		page( this.getAddNewDomainUrl() );
	};

	trackMenuClick = ( reactEvent ) => {
		this.props.trackAddDomainMenuClick( reactEvent.target.pathname );
	};

	renderOptions = () => {
		const { allDomainsList, selectedSiteSlug, specificSiteActions, translate } = this.props;

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
				<PopoverMenuItem icon="plus" href="/new" onClick={ this.trackMenuClick }>
					{ translate( 'Add a domain to a new site' ) }
				</PopoverMenuItem>
				<PopoverMenuItem icon="create" href="/domains/add" onClick={ this.trackMenuClick }>
					{ selectedSiteSlug
						? translate( 'Add a domain to a different site' )
						: translate( 'Add a domain to an existing site' ) }
				</PopoverMenuItem>
				<PopoverMenuItem icon="domains" href="/start/domain" onClick={ this.trackMenuClick }>
					{ translate( 'Add a domain without a site' ) }
				</PopoverMenuItem>
			</Fragment>
		);
	};

	renderLabel() {
		const { specificSiteActions, translate } = this.props;

		let label = translate( 'Other domain options' );
		if ( specificSiteActions ) {
			label = translate( 'Add new domain' );
		}

		return (
			<>
				<Icon icon={ plus } className="options-domain-button__add gridicon" viewBox="2 2 20 20" />
				<span className="options-domain-button__desktop">{ label }</span>
			</>
		);
	}

	render() {
		const { specificSiteActions, ellipsisButton, isBreakpointActive, translate } = this.props;
		const label = specificSiteActions
			? translate( 'Add new domain' )
			: translate( 'Other domain options' );

		if ( ellipsisButton ) {
			return (
				<EllipsisMenu popoverClassName="options-domain-button__popover" position="bottom">
					{ this.renderOptions() }
				</EllipsisMenu>
			);
		}

		return (
			<SplitButton
				popoverContext={ this.addDomainButtonRef }
				className={ classNames( 'options-domain-button', {
					ellipsis: ellipsisButton,
				} ) }
				primary
				whiteSeparator
				label={ isBreakpointActive ? undefined : label }
				toggleIcon={ isBreakpointActive ? 'plus' : undefined }
				href={ this.getAddNewDomainUrl() }
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

export default compose(
	connect(
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
	),
	localize,
	withMobileBreakpoint
)( AddDomainButton );
