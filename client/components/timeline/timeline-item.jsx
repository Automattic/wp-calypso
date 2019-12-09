/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import moment from 'moment';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import CompactCard from 'components/card/compact';
import Gridicon from 'components/gridicon';

export default class TimelineItem extends PureComponent {
	static propTypes = {
		actionIsBusy: PropTypes.bool,
		actionIsDisabled: PropTypes.bool,
		actionIsPrimary: PropTypes.bool,
		actionIsScary: PropTypes.bool,
		actionLabel: PropTypes.string,
		date: PropTypes.instanceOf( Date ),
		dateFormat: PropTypes.string,
		detail: PropTypes.string,
		disabled: PropTypes.bool,
		icon: PropTypes.string.isRequired,
		iconBackground: PropTypes.string,
		onActionClick: PropTypes.func,
	};

	static defaultProps = {
		actionIsPrimary: false,
		dateFormat: 'DD MMMM YYYY',
		disabled: false,
		iconBackground: 'info',
	};

	render() {
		const {
			actionIsBusy,
			actionIsDisabled,
			actionIsPrimary,
			actionIsScary,
			actionLabel,
			date,
			dateFormat,
			detail,
			disabled,
			icon,
			iconBackground,
			onActionClick,
		} = this.props;
		const cardClasses = classNames( 'timeline-item', { 'is-disabled': disabled } );
		const iconClasses = classNames( 'timeline-item__icon', iconBackground );

		return (
			<CompactCard className={ cardClasses }>
				<div className="timeline-item__icon-wrapper timeline-item__column">
					<div className={ iconClasses }>
						<Gridicon icon={ icon } size={ 18 } iconsThatNeedOffset={ false } />
					</div>
				</div>
				<div className="timeline-item__main-message timeline-item__column">
					<div className="timeline-item__title">{ moment( date ).format( dateFormat ) }</div>
					<div className="timeline-item__detail">{ detail }</div>
				</div>
				<div className="timeline-item__action-button-wrapper timeline-item__column">
					{ actionLabel && onActionClick && (
						<Button
							busy={ actionIsBusy }
							className="timeline-item__action-button"
							disabled={ actionIsDisabled || disabled }
							primary={ actionIsPrimary }
							compact
							onClick={ onActionClick }
							scary={ actionIsScary }
						>
							{ actionLabel }
						</Button>
					) }
				</div>
			</CompactCard>
		);
	}
}
