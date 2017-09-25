/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isFrontPage, isPostsPage } from 'state/pages/selectors';

function PageCardInfo( { translate, moment, page, showTimestamp, isFront, isPosts, siteUrl } ) {
	const iconSize = 12;

	return (
		<div className="page-card-info">
			{ siteUrl &&
				<div className="page-card-info__site-url">
					{ siteUrl }
				</div>
			}
			<div>
				{ showTimestamp &&
					<span className="page-card-info__item">
						<Gridicon icon="time" size={ iconSize } className="page-card-info__item-icon" />
						<span className="page-card-info__item-text">
							{ moment( page.modified ).fromNow() }
						</span>
					</span>
				}
				{ isFront &&
					<span className="page-card-info__item">
						<Gridicon icon="house" size={ iconSize } className="page-card-info__item-icon" />
						<span className="page-card-info__item-text">
							{ translate( 'Front page' ) }
						</span>
					</span>
				}
				{ isPosts &&
					<span className="page-card-info__item">
						<Gridicon icon="posts" size={ iconSize } className="page-card-info__item-icon" />
						<span className="page-card-info__item-text">
							{ translate( 'Your latest posts' ) }
						</span>
					</span>
				}
			</div>
		</div>
	);
}

export default connect(
	( state, props ) => {
		return {
			isFront: isFrontPage( state, props.page.site_ID, props.page.ID ),
			isPosts: isPostsPage( state, props.page.site_ID, props.page.ID ),
		};
	}
)( localize( PageCardInfo ) );
