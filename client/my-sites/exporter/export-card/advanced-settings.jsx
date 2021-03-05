/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import PostTypeOptions from './post-type-options';
import SpinnerButton from 'calypso/components/spinner-button';
import { isDateRangeValid as isExportDateRangeValid } from 'calypso/state/exporter/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

/**
 * Displays additional options for customising an export
 *
 * Allows the user to select whether Pages, Posts and Feedback are
 * exported. Posts and Pages can also be filtered by Authors, Statuses,
 * and Date.
 */
class AdvancedSettings extends React.Component {
	static displayName = 'AdvancedSettings';

	static propTypes = {
		// Event handlers
		onSelectPostType: PropTypes.func.isRequired,
		onClickExport: PropTypes.func.isRequired,

		// Data
		postType: PropTypes.string,
	};

	render() {
		return (
			<div className="export-card__advanced-settings">
				<h1 className="export-card__advanced-settings-title">
					{ this.props.translate( 'Select specific content to export' ) }
				</h1>
				<p className="export-card__advanced-settings-description">
					{ this.props.translate(
						'Use the options below to select a specific content ' +
							'type to download. You can select Posts, Pages, ' +
							'or Feedback, and filter by the listed parameters. ' +
							'After making your selection you can download your ' +
							'content in an .xml file.'
					) }
				</p>
				<div className="export-card__advanced-settings-row">
					<PostTypeOptions postType="post" legend={ this.props.translate( 'Posts' ) } />
					<PostTypeOptions postType="page" legend={ this.props.translate( 'Pages' ) } />
					<PostTypeOptions
						postType="feedback"
						legend={ this.props.translate( 'Feedback' ) }
						description={ this.props.translate( 'Survey results etc.' ) }
					/>
				</div>
				<SpinnerButton
					className="export-card__export-button"
					disabled={ ! this.props.isValid }
					loading={ this.props.shouldShowProgress }
					isPrimary={ false }
					onClick={ this.props.onClickExport }
					text={ this.props.translate( 'Export selected content' ) }
					loadingText={ this.props.translate( 'Exporting…' ) }
				/>
			</div>
		);
	}
}

const mapStateToProps = ( state, ownProps ) => {
	const siteId = getSelectedSiteId( state );
	const postType = ownProps.postType;
	const isDateValid = isExportDateRangeValid( state, siteId, postType );
	return {
		siteId,
		isValid: postType && isDateValid,
	};
};

export default connect( mapStateToProps )( localize( AdvancedSettings ) );
