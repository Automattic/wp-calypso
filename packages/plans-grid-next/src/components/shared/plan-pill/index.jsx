import './style.scss';

export default ( props ) => (
	<div className={ `plans-grid__plan-pill${ props.isInSignup ? ' is-in-signup' : '' }` }>
		{ props.children }
	</div>
);
