import classNames from 'classnames';

import './style.scss';

export default ( props ) => (
	<div className={ classNames( 'plan-pill', { 'is-in-signup': props.isInSignup } ) }>
		{ props.children }
	</div>
);
