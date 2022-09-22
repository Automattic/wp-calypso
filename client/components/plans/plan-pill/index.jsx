import './style.scss';

export default ( props ) => (
	<div
		className={ `plan-pill${ props.isInSignup ? ' is-in-signup' : '' }${
			props.isCurrentPlan ? ' is-current-plan' : ''
		}` }
	>
		{ props.children }
	</div>
);
