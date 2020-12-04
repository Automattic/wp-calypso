/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import Gridicon from 'calypso/components/gridicon';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Spinner from 'calypso/components/spinner';
import FoldableCard from 'calypso/components/foldable-card';

const StepContainer = ( {
	isSuccess,
	isWarning,
	isError,
	isProgress,
	title,
	summary,
	children,
	expanded,
	toggleStep,
	translate,
} ) => {
	const getIcon = () => {
		if ( isSuccess ) {
			return 'checkmark-circle';
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

	summary = (
		<span className={ className }>
			<span>{ summary }</span>
			<div className="label-purchase-modal__step-status">
				{ isProgress ? (
					<Spinner size={ 18 } />
				) : (
					<Gridicon icon={ getIcon() } className={ className } size={ 18 } />
				) }
			</div>
		</span>
	);
	const header = (
		<div>
			<div className="label-purchase-modal__step-title">{ title }</div>
		</div>
	);

	return (
		<FoldableCard
			header={ header }
			summary={ summary }
			expandedSummary={ summary }
			clickableHeader
			compact
			screenReaderText={ translate( 'Expand' ) }
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

export default localize( StepContainer );
