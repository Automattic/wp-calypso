/* eslint-disable jsx-a11y/anchor-is-valid */
import config from '@automattic/calypso-config';
import { Gridicon } from '@automattic/components';
import { Icon, close } from '@wordpress/icons';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import { gaRecordEvent } from 'calypso/lib/analytics/ga';
import wpcom from 'calypso/lib/wp';
import { getSiteDomain } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

class StatsActionFollow extends Component {
	state = {
		isFollowing: this.props.isFollowing,
	};

	clickHandler = ( event ) => {
		let gaEvent;

		event.stopPropagation();
		event.preventDefault();

		if ( ! this.state.isFollowing ) {
			// Intentionally optimistic update.
			this.setState( {
				isFollowing: true,
			} );

			gaEvent = 'Follow';
			wpcom
				.site( this.props.siteId )
				.follow()
				.add( { source: config( 'readerFollowingSource' ) } )
				.catch( () => {
					// Revert to the previous state
					this.setState( {
						isFollowing: false,
					} );
				} );
		} else {
			// Intentionally optimistic update.
			this.setState( {
				isFollowing: false,
			} );

			gaEvent = 'Unfollow';
			wpcom
				.site( this.props.siteId )
				.follow()
				.del( { source: config( 'readerFollowingSource' ) } )
				.catch( () => {
					// Revert to the previous state
					this.setState( {
						isFollowing: true,
					} );
				} );
		}

		gaRecordEvent( 'Stats', 'Clicked ' + gaEvent + ' in ' + this.props.moduleName + ' List' );
	};

	render() {
		const { siteDomain } = this.props;
		const { isFollowing } = this.state;
		const wrapperClass = clsx( 'module-content-list-item-action-wrapper', {
			follow: ! isFollowing,
			following: isFollowing,
		} );
		const label = isFollowing
			? this.props.translate( 'Subscribed', {
					context: 'Stats: Subscribe action / Subscription status',
			  } )
			: this.props.translate( 'Subscribe', {
					context: 'Stats: Subscribe action / Subscription status',
			  } );
		const gridiconType = isFollowing ? 'reader-following' : 'reader-follow';
		const wrapperClassSet = clsx( wrapperClass );

		return (
			<li className="module-content-list-item-action">
				<a
					href="#"
					onClick={ this.clickHandler }
					className={ wrapperClassSet }
					title={ siteDomain }
					aria-label={ this.props.translate( "Subscribe or unsubscribe to user's site", {
						textOnly: true,
						context: 'Stats ARIA label: Subscribe/Unsubscribe action',
					} ) }
				>
					<span className="module-content-list-item-action-label">
						<Gridicon icon={ gridiconType } size={ 18 } />
						{ label }
					</span>
					<span className="module-content-list-item-action-label unfollow">
						<Icon className="stats-icon" icon={ close } size={ 18 } />
						{ this.props.translate( 'Unsubscribe', {
							context: 'Stats ARIA label: Unsubscribe action',
						} ) }
					</span>
				</a>
			</li>
		);
	}
}

export default connect( ( state, { siteId } ) => ( {
	siteDomain: getSiteDomain( state, siteId ),
	selectedSiteId: getSelectedSiteId( state ),
} ) )( localize( StatsActionFollow ) );
