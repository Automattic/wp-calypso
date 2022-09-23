import classNames from 'classnames';
import './style.scss';

export default ( props ) => (
	<div
		className={ classNames( 'plan-pill', {
			'is-in-signup': props.isInSignup,
			'is-current-plan': props.isCurrentPlan,
			'is-in-marketplace': props.isInMarketplace,
		} ) }
	>
		{ props.children }
	</div>
);
