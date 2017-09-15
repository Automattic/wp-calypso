/**
 * External dependencies
 */
import React, { Component } from 'react';
import 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { flowRight } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import HeaderCake from 'components/header-cake';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import DeleteZoneDialog from './delete-zone-dialog';
import QueryFeed from '../../data/query-feed';
import ZoneDetailsForm from '../../forms/zone-details-form';
import ZoneContentForm from '../../forms/zone-content-form';
import { saveFeed } from '../../../state/feeds/actions';
import { deleteZone, saveZone } from '../../../state/zones/actions';
import { getFeed } from '../../../state/feeds/selectors';
import { getZone } from '../../../state/zones/selectors';
import { settingsPath } from '../../../app/util';

class Zone extends Component {

	static propTypes = {
		deleteZone: PropTypes.func.isRequired,
		feed: PropTypes.array,
		saveFeed: PropTypes.func.isRequired,
		saveZone: PropTypes.func.isRequired,
		siteId: PropTypes.number,
		siteSlug: PropTypes.string,
		translate: PropTypes.func.isRequired,
		zone: PropTypes.object,
		zoneId: PropTypes.number,
	}

	state = {
		showDeleteDialog: false,
	}

	showDeleteDialog = () => this.setState( { showDeleteDialog: true } );

	hideDeleteDialog = () => this.setState( { showDeleteDialog: false } );

	deleteZone = () => this.props.deleteZone( this.props.siteId, this.props.zoneId );

	saveZoneDetails = ( form, data ) => this.props.saveZone( this.props.siteId, this.props.zoneId, form, data );

	saveZoneFeed = ( form, data ) => this.props.saveFeed( this.props.siteId, this.props.zoneId, form, data.posts );

	render() {
		const { feed, siteId, siteSlug, translate, zone, zoneId } = this.props;
		const { showDeleteDialog } = this.state;

		return (
			<div>
				{ siteId && zoneId && <QueryFeed siteId={ siteId } zoneId={ zoneId } /> }

				<HeaderCake
					backHref={ `${ settingsPath }/${ siteSlug }` }
					actionButton={ <Button compact primary scary onClick={ this.showDeleteDialog }>{ translate( 'Delete' ) }</Button> } >
					{ translate( 'Edit zone' ) }
				</HeaderCake>

				{
					showDeleteDialog &&
					<DeleteZoneDialog
						zoneName={ zone.name }
						onConfirm={ this.deleteZone }
						onCancel={ this.hideDeleteDialog } />
					}

				<ZoneDetailsForm
					label={ translate( 'Zone label' ) }
					onSubmit={ this.saveZoneDetails }
					initialValues={ zone } />

				<ZoneContentForm
					label={ translate( 'Zone content' ) }
					onSubmit={ this.saveZoneFeed }
					initialValues={ { posts: feed } } />
			</div>
		);
	}
}

const connectComponent = connect(
	( state, { zoneId } ) => {
		const siteId = getSelectedSiteId( state );

		return {
			siteId,
			siteSlug: getSelectedSiteSlug( state ),
			zone: getZone( state, siteId, zoneId ),
			feed: getFeed( state, siteId, zoneId ),
		};
	},
	{ deleteZone, saveZone, saveFeed },
);

export default flowRight(
	connectComponent,
	localize,
)( Zone );
