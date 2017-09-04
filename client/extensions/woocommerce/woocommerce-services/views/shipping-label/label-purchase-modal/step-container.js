/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import Gridicon from 'gridicons';
import { translate as __ } from 'i18n-calypso';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import LoadingSpinner from 'components/loading-spinner';
import FoldableCard from 'components/foldable-card';

const StepContainer = ( { isSuccess, isWarning, isError, isProgress, title, summary, children, expanded, toggleStep } ) => {
	const getIcon = () => {
		if ( isSuccess ) {
			return 'checkmark';
		}
		if ( isWarning ) {
			return 'notice-outline';
		}
		if ( isError ) {
			return 'notice-outline';
		}
		return '';
	};
	const className = classNames( {
		'is-success': isSuccess,
		'is-warning': isWarning,
		'is-error': isError,
	} );

	summary = <span className={ className }>{ summary }</span>;
	const header = (
		<div>
			<div className="label-purchase-modal__step-status">
				{ isProgress ? <LoadingSpinner inline /> : <Gridicon icon={ getIcon() } className={ className } size={ 24 } /> }
			</div>
			<div className="label-purchase-modal__step-title">{ title }</div>
		</div>
	);

	return (
		<FoldableCard
			header={ header }
			summary={ summary }
			expandedSummary={ summary }
			clickableHeader={ true }
			compact
			screenReaderText={ __( 'Expand' ) }
			expanded={ expanded }
			onClick={ toggleStep }
		>
			{ children }
		</FoldableCard>
	);
};

StepContainer.propTypes = {
	isSuccess: PropTypes.bool,
	isWarning: PropTypes.bool,
	isError: PropTypes.bool,
	isProgress: PropTypes.bool,
	title: PropTypes.string.isRequired,
	summary: PropTypes.string,
	expanded: PropTypes.bool,
};

export default StepContainer;
