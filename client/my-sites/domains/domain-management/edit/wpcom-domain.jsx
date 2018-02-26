/** @format */
/**
 * External dependencies
 */
import React from 'react';
import createReactClass from 'create-react-class';
import { bindActionCreators } from 'redux';
import { localize } from 'i18n-calypso';
import { flow, get } from 'lodash';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isEnabled } from 'config';
import analyticsMixin from 'lib/mixins/analytics';
import Card from 'components/card';
import Header from './card/header';
import Notice from 'components/notice';
import Property from './card/property';
import VerticalNav from 'components/vertical-nav';
import VerticalNavItem from 'components/vertical-nav/item';
import { getSelectedSiteId } from 'state/ui/selectors';
import { requestSiteRename } from 'state/site-rename/actions';
import SiteRenamer from 'blocks/simple-site-rename-form';
import { type as domainTypes } from 'lib/domains/constants';

const WpcomDomain = createReactClass( {
	displayName: 'WpcomDomain',
	mixins: [ analyticsMixin( 'domainManagement', 'edit' ) ],

	handleEditSiteAddressClick() {
		this.recordEvent( 'navigationClick', 'Edit Site Address', this.props.domain );
	},

	getEditSiteAddressBlock() {
		const { domain, translate } = this.props;

		/**
		 * Hide Edit site address for .blog subdomains as this is unsupported for now.
		 */
		if ( get( domain, 'name', '' ).match( /\.\w+\.blog$/ ) ) {
			return null;
		}

		if ( isEnabled( 'site-address-editor' ) && get( domain, 'type' ) === domainTypes.WPCOM ) {
			if ( ! domain.currentUserCanManage ) {
				return (
					/**
					 * See: `NonOwnerCard` for other `domain.currentUserCanManage` usage
					 * Unfortunately, we don't know the domain owner here & the above component takes an annotated list of domains.
					 * @TODO Derive the owner from the state tree and display them so customers know who to contact.
					 * @TODO Should this be a more basic `<Card />` instead of a `<Notice />` or wrapped in one?
					 * @TODO Finalize copy
					 */
					<Notice
						status="is-info"
						showDismiss={ false }
						text={ translate(
							'The site address can only be changed by the site owner. Please contact them if you would like to change it.'
						) }
					/>
				);
			}

			return <SiteRenamer currentDomain={ domain } />;
		}

		return (
			<VerticalNav>
				<VerticalNavItem
					path={ `https://${ this.props.domain.name }/wp-admin/index.php?page=my-blogs#blog_row_${
						this.props.selectedSite.ID
					}` }
					external={ true }
					onClick={ this.handleEditSiteAddressClick }
				>
					{ this.props.translate( 'Edit Site Address' ) }
				</VerticalNavItem>
			</VerticalNav>
		);
	},

	render() {
		return (
			<div>
				<div className="domain-details-card">
					<Header { ...this.props } />

					<Card>
						<Property label={ this.props.translate( 'Type', { context: 'A type of domain.' } ) }>
							{ this.props.translate( 'Included with Site' ) }
						</Property>

						<Property
							label={ this.props.translate( 'Renews on', {
								comment:
									'The corresponding date is in a different cell in the UI, the date is not included within the translated string',
							} ) }
						>
							<em>{ this.props.translate( 'Never Expires' ) }</em>
						</Property>
					</Card>
				</div>
				{ this.getEditSiteAddressBlock() }
			</div>
		);
	},
} );

export default flow(
	localize,
	connect(
		state => ( {
			siteId: getSelectedSiteId( state ),
		} ),
		dispatch => bindActionCreators( { requestSiteRename }, dispatch )
	)
)( WpcomDomain );
