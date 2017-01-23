/* eslint-disable react/no-danger  */

/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';
import { localize } from 'i18n-calypso';
import Navigation from './theme-content-sections/navigation';
import Overview from './theme-content-sections/overview';
import Setup from './theme-content-sections/setup';
import Support from './theme-content-sections/support';

const PreviewButton = localize(
	( { theme, togglePreview, translate } ) => {
		if ( ! theme.demo_uri ) {
			return null;
		}

		return (
			<a className="theme__sheet-preview-link" onClick={ togglePreview } data-tip-target="theme-sheet-preview">
				<Gridicon icon="themes" size={ 18 } />
				<span className="theme__sheet-preview-link-text">
					{ translate( 'Open Live Demo', { context: 'Individual theme live preview button' } ) }
				</span>
			</a>
		);
	}
);

const Screenshot = ( { isLoaded, isJetpack, theme, togglePreview } ) => {
	const fullLengthScreenshot = () =>
		isLoaded ? theme.screenshots[ 0 ] : null;
	const screenshot = isJetpack ? theme.screenshot : fullLengthScreenshot();
	const img = screenshot && <img className="theme__sheet-img" src={ screenshot + '?=w680' } />;

	return (
		<div className="theme__sheet-screenshot">
			<PreviewButton
				togglePreview={ togglePreview }
				theme={ theme }
			/>
			{ img }
		</div>
	);
};

class ThemeSheetContent extends React.Component {
	static propTypes = {
		section: React.PropTypes.string,
		isJetpack: React.PropTypes.bool,
		togglePreview: React.PropTypes.func,
		siteSlug: React.PropTypes.string,
		id: React.PropTypes.string,
		isLoaded: React.PropTypes.bool,
		isCurrentUserPaid: React.PropTypes.bool,
		theme: React.PropTypes.object,
	};

	renderSectionContent( section ) {
		return {
			'': <Overview { ...this.props } />,
			setup: <Setup documentation={ this.props.theme.supportDocumentation } />,
			support: <Support { ...this.props } />,
		}[ section ];
	}

	render() {
		const { id, isJetpack, isLoaded, theme, section, siteSlug } = this.props;

		return (
			<div className="theme__sheet-columns">
				<div className="theme__sheet-column-left">
					<div className="theme__sheet-content">
						<Navigation
							siteSlug={ siteSlug }
							id={ id }
							isLoaded={ isLoaded }
							currentSection={ section }
							theme={ theme }
						/>
						{ this.renderSectionContent( section ) }
						<div className="theme__sheet-footer-line"><Gridicon icon="my-sites" /></div>
					</div>
				</div>
				<div className="theme__sheet-column-right">
					<Screenshot
						isJetpack={ isJetpack }
						isLoaded={ isLoaded }
						theme={ theme }
					/>
				</div>
			</div>
		);
	}
}

export default localize( ThemeSheetContent );
