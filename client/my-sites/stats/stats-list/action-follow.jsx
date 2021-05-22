/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import config from '@automattic/calypso-config';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Gridicon from 'calypso/components/gridicon';
import wpcom from 'calypso/lib/wp';
import { gaRecordEvent } from 'calypso/lib/analytics/ga';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { getSiteDomain } from 'calypso/state/sites/selectors';

class StatsActionFollow extends React.Component {
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
		const wrapperClass = classNames( 'module-content-list-item-action-wrapper', {
			follow: ! isFollowing,
			following: isFollowing,
		} );
		const label = isFollowing
			? this.props.translate( 'Following', {
					context: 'Stats: Follow action / Following status',
			  } )
			: this.props.translate( 'Follow', {
					context: 'Stats: Follow action / Following status',
			  } );
		const gridiconType = isFollowing ? 'reader-following' : 'reader-follow';
		const wrapperClassSet = classNames( wrapperClass );

		return (
			<li className="module-content-list-item-action">
				<a
					href="#"
					onClick={ this.clickHandler }
					className={ wrapperClassSet }
					title={ siteDomain }
					aria-label={ this.props.translate( 'Follow or unfollow user', {
						textOnly: true,
						context: 'Stats ARIA label: Follow/Unfollow action',
					} ) }
				>
					<span className="module-content-list-item-action-label">
						<Gridicon icon={ gridiconType } size={ 18 } />
						{ label }
					</span>
					<span className="module-content-list-item-action-label unfollow">
						<Gridicon icon="cross" size={ 18 } />
						{ this.props.translate( 'Unfollow', {
							context: 'Stats ARIA label: Unfollow action',
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
