/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Style dependencies
 */
import './style.scss';

class ReadingTime extends React.PureComponent {
	render() {
		const words = this.props.words || 0;
		const timeInMinutes = Math.round( this.props.readingTime / 60 );
		let approxTime = null;

		if ( timeInMinutes > 1 ) {
			approxTime = (
				<span className="reading-time__approx">
					({ ' ' }
					{ this.props.translate( '~%d min', {
						args: [ timeInMinutes ],
						context: 'An approximate time to read something, in minutes',
					} ) }
					)
				</span>
			);
		}

		const readingTime = this.props.translate( '%d word {{Time/}}', '%d words {{Time/}}', {
			count: words,
			args: [ words ],
			components: { Time: approxTime },
		} );

		return <span className="byline__reading-time reading-time">{ readingTime }</span>;
	}
}

export default localize( ReadingTime );
