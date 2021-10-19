import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import { type } from 'calypso/lib/domains/constants';
import Breadcrumbs from 'calypso/my-sites/domains/domain-management/components/breadcrumbs';
import FreeDomainItem from 'calypso/my-sites/domains/domain-management/list/free-domain-item';
import AddDomainButton from 'calypso/my-sites/domains/domain-management/list/options-domain-button';
import { domainManagementList } from 'calypso/my-sites/domains/paths';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import {
	composeAnalytics,
	recordGoogleEvent,
	recordTracksEvent,
} from 'calypso/state/analytics/actions';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { getCurrentRoute } from 'calypso/state/selectors/get-current-route';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { setPrimaryDomain } from 'calypso/state/sites/domains/actions';
import { showUpdatePrimaryDomainSuccessNotice, showUpdatePrimaryDomainErrorNotice } from './utils';

import './list-new.scss';

class ListNew extends Component {
	static propTypes = {
		selectedSite: PropTypes.object.isRequired,
		domains: PropTypes.array.isRequired,
		isRequestingDomains: PropTypes.bool,
		context: PropTypes.object,
		renderAllSites: PropTypes.bool,
		hasSingleSite: PropTypes.bool,
	};

	static defaultProps = {
		changePrimary: () => {},
	};

	state = {
		settingPrimaryDomain: false,
		primaryDomainIndex: -1,
	};

	setPrimaryDomain( domainName ) {
		return new Promise( ( resolve, reject ) => {
			this.props.setPrimaryDomain( this.props.selectedSite.ID, domainName, ( error, data ) => {
				if ( ! error && data && data.success ) {
					page.redirect( domainManagementList( this.props.selectedSite.slug ) );
					resolve();
				} else {
					reject( error );
				}
			} );
		} );
	}

	handleUpdatePrimaryDomainWpcom = ( domainName ) => {
		if ( this.state.settingPrimaryDomain ) {
			return;
		}

		this.props.changePrimary( domainName, 'wpcom_domain_manage_click' );

		const currentPrimaryIndex = this.props.domains.findIndex( ( { isPrimary } ) => isPrimary );
		this.setState( { settingPrimaryDomain: true, primaryDomainIndex: -1 } );

		return this.setPrimaryDomain( domainName )
			.then(
				() => {
					this.setState( { primaryDomainIndex: -1 } );
					showUpdatePrimaryDomainSuccessNotice( domainName );
				},
				( error ) => {
					showUpdatePrimaryDomainErrorNotice( error.message );
					this.setState( { primaryDomainIndex: currentPrimaryIndex } );
				}
			)
			.finally( () => this.setState( { settingPrimaryDomain: false } ) );
	};

	renderBreadcrumbs() {
		const { translate } = this.props;

		const item = {
			label: 'Domains',
			helpBubble: translate(
				'Manage the domains connected to your site. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
				{
					components: {
						learnMoreLink: <InlineSupportLink supportContext="domains" showIcon={ false } />,
					},
				}
			),
		};
		const buttons = [
			<AddDomainButton key="breadcrumb_button_1" specificSiteActions />,
			<AddDomainButton key="breadcrumb_button_2" ellipsisButton />,
		];

		return (
			<Breadcrumbs
				items={ [ item ] }
				mobileItem={ item }
				buttons={ buttons }
				mobileButtons={ buttons }
			/>
		);
	}

	renderFreeWpcomAddress() {
		const { selectedSite, domains, currentRoute, isAtomicSite } = this.props;
		const { settingPrimaryDomain } = this.state;

		const disabled = settingPrimaryDomain;
		const wpcomDomain = domains.find(
			( domain ) => domain.type === type.WPCOM || domain.isWpcomStagingDomain
		);

		return (
			wpcomDomain && (
				<FreeDomainItem
					key="wpcom-domain-item"
					isAtomicSite={ isAtomicSite }
					currentRoute={ currentRoute }
					domain={ wpcomDomain }
					disabled={ disabled }
					isBusy={ settingPrimaryDomain }
					site={ selectedSite }
					onMakePrimary={ this.handleUpdatePrimaryDomainWpcom }
				/>
			)
		);
	}

	render() {
		return (
			<Main fullWidthLayout>
				<BodySectionCssClass bodyClass={ [ 'edit__body-white' ] } />
				{ this.renderBreadcrumbs() }
				<SidebarNavigation />
				{ this.renderFreeWpcomAddress() }
			</Main>
		);
	}
}

const changePrimary = ( domain, mode ) =>
	composeAnalytics(
		recordGoogleEvent(
			'Domain Management',
			'Changed Primary Domain to in List',
			'Domain Name',
			domain.name
		),
		recordTracksEvent( 'calypso_domain_management_list_change_primary_domain_click', {
			section: domain.type,
			mode,
		} )
	);

export default connect(
	( state, ownProps ) => {
		const siteId = ownProps?.selectedSite?.ID || null;
		const userCanManageOptions = canCurrentUser( state, siteId, 'manage_options' );

		return {
			currentRoute: getCurrentRoute( state ),
			isAtomicSite: isSiteAutomatedTransfer( state, siteId ),
			userCanManageOptions,
		};
	},
	( dispatch ) => {
		return {
			setPrimaryDomain: ( ...props ) => setPrimaryDomain( ...props )( dispatch ),
			changePrimary: ( domain, mode ) => dispatch( changePrimary( domain, mode ) ),
		};
	}
)( localize( ListNew ) );
