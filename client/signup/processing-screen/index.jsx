/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { addHotJarScript } from 'calypso/lib/analytics/hotjar';

/**
 * Internal dependencies
 */
import Gridicon from 'calypso/components/gridicon';

/**
 * Style dependencies
 */
import './style.scss';

export class SignupProcessingScreen extends Component {
	renderFloaties() {
		// Non standard gridicon sizes are used here because we display giant, floating icons on the page with an animation
		/* eslint-disable wpcalypso/jsx-gridicon-size, wpcalypso/jsx-classname-namespace */
		return (
			<div className="signup-processing-screen__floaties">
				<Gridicon icon="add" size={ 64 } />
				<Gridicon icon="aside" size={ 64 } />
				<Gridicon icon="attachment" size={ 64 } />
				<Gridicon icon="audio" size={ 64 } />
				<Gridicon icon="bell" size={ 64 } />
				<Gridicon icon="book" size={ 64 } />
				<Gridicon icon="camera" size={ 64 } />
				<Gridicon icon="comment" size={ 64 } />
				<Gridicon icon="globe" size={ 64 } />
				<Gridicon icon="pencil" size={ 64 } />
				<Gridicon icon="phone" size={ 64 } />
				<Gridicon icon="reader" size={ 64 } />
				<Gridicon icon="star" size={ 64 } />
				<Gridicon icon="video" size={ 64 } />
				<Gridicon icon="align-image-right" size={ 64 } />
				<Gridicon icon="bookmark" size={ 64 } />
				<Gridicon icon="briefcase" size={ 64 } />
				<Gridicon icon="calendar" size={ 64 } />
				<Gridicon icon="clipboard" size={ 64 } />
				<Gridicon icon="cloud-upload" size={ 64 } />
				<Gridicon icon="cog" size={ 64 } />
				<Gridicon icon="customize" size={ 64 } />
				<Gridicon icon="help" size={ 64 } />
				<Gridicon icon="link" size={ 64 } />
				<Gridicon icon="lock" size={ 64 } />
				<Gridicon icon="pages" size={ 64 } />
				<Gridicon icon="share" size={ 64 } />
				<Gridicon icon="stats" size={ 64 } />
			</div>
		);
		/* eslint-enable wpcalypso/jsx-gridicon-size, wpcalypso/jsx-classname-namespace */
	}

	getTitle() {
		return this.props.translate( '{{strong}}Hooray!{{/strong}} Your site will be ready shortly.', {
			components: { strong: <strong />, br: <br /> },
			comment:
				'The second line after the breaking tag {{br/}} should fit unbroken in 384px and greater and have a max of 30 characters.',
		} );
	}

	componentDidMount() {
		const { flowName, localeSlug } = this.props;
		if ( ! localeSlug ) {
			return;
		}
		const locale = localeSlug.split( /[-_]/ )[ 0 ];
		if ( flowName !== 'onboarding' || ! [ 'en', 'ja' ].includes( locale ) ) {
			return;
		}
		addHotJarScript();
		if ( window && window.hj ) {
			window.hj( 'trigger', 'bizx_questionnaire_' + locale );
		}
	}

	render() {
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<div>
				{ this.renderFloaties() }
				<div className="signup-processing-screen__content">
					<p className="signup-processing-screen__title">{ this.getTitle() }</p>
				</div>
			</div>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}
}

export default localize( SignupProcessingScreen );
