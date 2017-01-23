/* eslint-disable react/no-danger  */

/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';
import Navigation from './theme-content-sections/navigation';
import Overview from './theme-content-sections/overview';
import Setup from './theme-content-sections/setup';
import Support from './theme-content-sections/support';
import Screenshot from './theme-content-sections/screenshot'

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
		const { id, isJetpack, isLoaded, theme, section, siteSlug, togglePreview } = this.props;

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
						togglePreview={ togglePreview }
					/>
				</div>
			</div>
		);
	}
}

export default ThemeSheetContent;
