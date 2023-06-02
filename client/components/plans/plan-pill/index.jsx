import './style.scss';

export default ( props ) => (
	<div className={ `plan-pill${ props.isInSignup ? ' is-in-signup' : '' }` }>
		{ props.children }
	</div>
);
