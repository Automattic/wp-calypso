/** @format */
/**
 * External dependencies
 */
import React from 'react';
import createReactClass from 'create-react-class';
import { bindActionCreators } from 'redux';
import { localize } from 'i18n-calypso';
import { flow } from 'lodash';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import analyticsMixin from 'lib/mixins/analytics';
import Card from 'components/card';
import Header from './card/header';
import Property from './card/property';
import { getSelectedSiteId } from 'state/ui/selectors';
import { requestSiteRename } from 'state/site-rename/actions';
import SiteRenamer from 'blocks/simple-site-rename-form';

const WpcomDomain = createReactClass( {
	displayName: 'WpcomDomain',
	mixins: [ analyticsMixin( 'domainManagement', 'edit' ) ],

	render() {
		const { domain } = this.props;
		const isDotBlogDomain = domain.name.match( /\.\w+\.blog$/ );

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
				{ ! isDotBlogDomain && <SiteRenamer currentDomain={ domain } /> }
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
