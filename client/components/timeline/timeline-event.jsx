import { Button, CompactCard, Gridicon } from '@automattic/components';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { withLocalizedMoment } from 'calypso/components/localized-moment';

class TimelineEvent extends PureComponent {
	static propTypes = {
		className: PropTypes.string,
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
			className,
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
			moment,
			onActionClick,
		} = this.props;
		const cardClasses = clsx( 'timeline-event', className, { 'is-disabled': disabled } );
		const iconClasses = clsx( 'timeline-event__icon', iconBackground );

		return (
			<CompactCard className={ cardClasses }>
				<div className="timeline-event__icon-wrapper timeline-event__column">
					<div className={ iconClasses }>
						<Gridicon icon={ icon } size={ 18 } />
					</div>
				</div>
				<div className="timeline-event__main-message timeline-event__column">
					<div className="timeline-event__title">{ moment( date ).format( dateFormat ) }</div>
					<div className="timeline-event__detail">{ detail }</div>
				</div>
				<div className="timeline-event__action-button-wrapper timeline-event__column">
					{ actionLabel && onActionClick && (
						<Button
							busy={ actionIsBusy }
							className="timeline-event__action-button"
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

export default withLocalizedMoment( TimelineEvent );
