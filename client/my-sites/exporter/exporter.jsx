/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import FoldableCard from 'components/foldable-card';
import AdvancedSettings from 'my-sites/exporter/advanced-settings';
import SpinnerButton from './spinner-button';

export default React.createClass( {
	displayName: 'Exporter',

	propTypes: {
		startExport: PropTypes.func.isRequired,
		setPostType: PropTypes.func.isRequired,

		shouldShowProgress: PropTypes.bool.isRequired,
		postType: PropTypes.string
	},

	render: function() {
		const { setPostType, startExport } = this.props;
		const { postType, shouldShowProgress } = this.props;

		const exportButton = (
			<SpinnerButton
				className="exporter__export-button"
				loading={ shouldShowProgress }
				isPrimary={ true }
				onClick={ startExport }
				text={ this.translate( 'Export All' ) }
				loadingText={ this.translate( 'Exporting…' ) } />
		);

		return (
			<div className="exporter">
				<FoldableCard
					actionButtonIcon="cog"
					header={
						<div>
							<h1 className="exporter__title">
								{ this.translate( 'Export your content' ) }
							</h1>
							<h2 className="exporter__subtitle">
								{ this.translate( 'Or select specific content items to export' ) }
							</h2>
						</div>
					}
					summary={ exportButton }
					expandedSummary={ exportButton }
					>
					<AdvancedSettings
						postType={ postType }
						shouldShowProgress={ shouldShowProgress }
						onSelectPostType={ setPostType }
						onClickExport={ startExport }
					/>
				</FoldableCard>
			</div>
		);
	}
} );
