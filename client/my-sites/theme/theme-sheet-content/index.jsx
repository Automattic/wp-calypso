/**
 * External dependencies
 */
import React from 'react';

class ThemeSheetContent extents React.Component {
	static propTypes = {
		section: React.PropTypes.string,
	};

	render () {
		const { section } = this.props;

		return (
			<div className="theme__sheet-columns">
				<div className="theme__sheet-column-left">
					<div className="theme__sheet-content">
						{ this.renderSectionNav( section ) }
						{ this.renderSectionContent( section ) }
						<div className="theme__sheet-footer-line"><Gridicon icon="my-sites" /></div>
					</div>
				</div>
				<div className="theme__sheet-column-right">
					{ this.renderScreenshot() }
				</div>
			</div>
		);
	};
}
