import { Card, Gridicon } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import PressThisLink from './link';

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
				<Card className="press-this__card site-settings">
					<p>
						{ translate(
							'{{strong}}Press This{{/strong}} allows you to copy text, images, and video from any web page and add them to a new post on your site, along with an automatic citation.',
							{ components: { strong: <strong /> } }
						) }
					</p>
					<p>
						<strong>{ translate( 'How to use Press This' ) }</strong>
					</p>
					<p>
						<ul>
							<li>
								{ translate(
									'Drag and drop the "Press This" button below to your bookmarks bar, or right-click the button to copy the link, then add the link to your favorites.'
								) }
							</li>
							<li>
								{ translate( "Highlight the text or item you'd like to copy into a new post." ) }
							</li>
							<li>{ translate( 'Click on the "Press This" bookmarklet / favorite.' ) }</li>
						</ul>
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
