/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import Gridicon from 'components/gridicon';
import PressThisLink from './link';
import { recordGoogleEvent } from 'state/analytics/actions';
import { getSelectedSite } from 'state/ui/selectors';

/**
 * Style dependencies
 */
import './style.scss';

class PressThis extends Component {
	static propTypes = {
		translate: PropTypes.func,
		site: PropTypes.object,
	};

	recordEvent( eventAction ) {
		return () => {
			this.props.recordGoogleEvent( 'Site Settings', eventAction );
		};
	}

	render() {
		const { site, translate } = this.props;

		return (
			<div className="press-this">
				<Card className="site-settings">
					<p>
						{ translate(
							'Press This is a bookmarklet: a little app that runs in your browser and lets you grab bits of the web.'
						) }
					</p>
					<p>
						{ translate(
							'Use Press This to clip text, images and videos from any web page. ' +
								'Then edit and add more straight from Press This before you save or publish it in a post on your site.'
						) }
					</p>
					<p>
						{ translate(
							'Drag-and-drop the following link to your bookmarks bar or right click it and add it to your favorites ' +
								'for a posting shortcut.'
						) }
					</p>
					{ site && (
						<p className="press-this__link-container">
							<PressThisLink
								site={ site }
								onClick={ this.recordEvent( 'Clicked Press This Button' ) }
								onDragStart={ this.recordEvent( 'Dragged Press This Button' ) }
							>
								<Gridicon icon="create" />
								<span>
									{ translate( 'Press This', { context: 'name of browser bookmarklet tool' } ) }
								</span>
							</PressThisLink>
						</p>
					) }
				</Card>
			</div>
		);
	}
}

export default connect(
	( state ) => ( {
		site: getSelectedSite( state ),
	} ),
	{
		recordGoogleEvent,
	}
)( localize( PressThis ) );
