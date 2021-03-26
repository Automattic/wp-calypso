/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { flowRight } from 'lodash';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import HeaderCake from 'calypso/components/header-cake';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import DeleteZoneDialog from './delete-zone-dialog';
import QueryFeed from '../../data/query-feed';
import ZoneContentForm from '../../forms/zone-content-form';
import ZoneDetailsForm from '../../forms/zone-details-form';
import ZoneLock from '../../data/zone-lock';
import ZoneLockWarningNotice from './zone-lock-warning-notice';
import ZoneNotFound from './zone-not-found';
import { saveFeed } from '../../../state/feeds/actions';
import { deleteZone, saveZone } from '../../../state/zones/actions';
import { getFeed, isRequestingFeed, isSavingFeed } from '../../../state/feeds/selectors';
import { blocked, expires } from '../../../state/locks/selectors';
import { getZone, isRequestingZones, isSavingZone } from '../../../state/zones/selectors';
import { settingsPath } from '../../../app/util';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';

class Zone extends Component {
	static propTypes = {
		deleteZone: PropTypes.func.isRequired,
		feed: PropTypes.array,
		lockBlocked: PropTypes.bool,
		lockExpires: PropTypes.number,
		requestingFeed: PropTypes.bool,
		requestingZones: PropTypes.bool,
		saveFeed: PropTypes.func.isRequired,
		saveZone: PropTypes.func.isRequired,
		savingZone: PropTypes.bool,
		siteId: PropTypes.number,
		siteSlug: PropTypes.string,
		translate: PropTypes.func.isRequired,
		zone: PropTypes.object,
		zoneId: PropTypes.number,
	};

	state = {
		showDeleteDialog: false,
	};

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( ! nextProps.lockExpires || nextProps.lockExpires === this.props.lockExpires ) {
			return;
		}

		// Add 2 seconds to the refresh clock to prevent race conditions
		this._refresh && clearTimeout( this._refresh );
		this._refresh = setTimeout(
			() => this.forceUpdate(),
			nextProps.lockExpires - new Date().getTime() + 2000
		);
	}

	showDeleteDialog = () => this.setState( { showDeleteDialog: true } );

	hideDeleteDialog = () => this.setState( { showDeleteDialog: false } );

	deleteZone = () =>
		this.props.deleteZone( this.props.siteId, this.props.siteSlug, this.props.zoneId );

	saveZoneDetails = ( data ) => this.props.saveZone( this.props.siteId, this.props.zoneId, data );

	saveZoneFeed = ( data ) => this.props.saveFeed( this.props.siteId, this.props.zoneId, data );

	disabled = () =>
		this.props.lockBlocked ||
		( this.props.lockExpires !== 0 && this.props.lockExpires < new Date().getTime() );

	renderContent = () => {
		const {
			feed,
			requestingFeed,
			requestingZones,
			savingFeed,
			savingZone,
			siteSlug,
			translate,
			zone,
		} = this.props;
		const { showDeleteDialog } = this.state;

		if ( ! zone ) {
			return <ZoneNotFound siteSlug={ siteSlug } />;
		}

		return (
			<div>
				<PageViewTracker
					path="/extensions/zoninator/zone/:site/:zone"
					title="WP Zone Manager > Edit Zone"
				/>

				{ showDeleteDialog && (
					<DeleteZoneDialog
						zoneName={ zone.name }
						onConfirm={ this.deleteZone }
						onCancel={ this.hideDeleteDialog }
					/>
				) }

				<ZoneDetailsForm
					disabled={ this.disabled() }
					label={ translate( 'Zone label' ) }
					requesting={ requestingZones }
					onSubmit={ this.saveZoneDetails }
					initialValues={ zone }
					submitting={ savingZone }
				/>

				<ZoneContentForm
					disabled={ this.disabled() }
					label={ translate( 'Zone content' ) }
					requesting={ requestingFeed }
					onSubmit={ this.saveZoneFeed }
					initialValues={ feed }
					submitting={ savingFeed }
				/>
			</div>
		);
	};

	render() {
		const { requestingZones, siteId, siteSlug, translate, zone, zoneId } = this.props;

		const deleteButton = (
			<Button compact primary scary onClick={ this.showDeleteDialog } disabled={ this.disabled() }>
				{ translate( 'Delete' ) }
			</Button>
		);

		return (
			<div>
				{ siteId && zoneId && <QueryFeed siteId={ siteId } zoneId={ zoneId } /> }
				{ siteId && zoneId && <ZoneLock siteId={ siteId } zoneId={ zoneId } /> }

				<HeaderCake
					backHref={ `${ settingsPath }/${ siteSlug }` }
					actionButton={ zone && deleteButton }
				>
					{ translate( 'Edit zone' ) }
				</HeaderCake>

				{ zone && this.disabled() && <ZoneLockWarningNotice siteId={ siteId } zoneId={ zoneId } /> }
				{ zone && ! requestingZones && this.renderContent() }
			</div>
		);
	}
}

const connectComponent = connect(
	( state, { zoneId } ) => {
		const siteId = getSelectedSiteId( state );

		return {
			lockBlocked: blocked( state, siteId, zoneId ),
			lockExpires: expires( state, siteId, zoneId ),
			requestingFeed: isRequestingFeed( state, siteId, zoneId ),
			requestingZones: isRequestingZones( state, siteId ),
			savingZone: isSavingZone( state, siteId ),
			savingFeed: isSavingFeed( state, siteId, zoneId ),
			siteId,
			siteSlug: getSelectedSiteSlug( state ),
			zone: getZone( state, siteId, zoneId ),
			feed: getFeed( state, siteId, zoneId ),
		};
	},
	{ deleteZone, saveZone, saveFeed }
);

export default flowRight( connectComponent, localize )( Zone );
