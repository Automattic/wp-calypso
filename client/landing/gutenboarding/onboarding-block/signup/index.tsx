/**
 * External dependencies
 */
import * as React from 'react';
import classnames from 'classnames';
import { useHistory } from 'react-router-dom';
import { useSelect, useDispatch } from '@wordpress/data';
import { useI18n } from '@automattic/react-i18n';

/**
 * Internal dependencies
 */
import { STORE_KEY } from '../../stores/onboard';
import { Step, usePath } from '../../path';
import SignupForm from '../../components/signup-form';

/**
 * Style dependencies
 */
import './style.scss';

// import SignupForm from 'blocks/signup-form'; // TODO: replace with gutenboarding specific form

const Signup: React.FunctionComponent = () => {
	const history = useHistory();
	const makePath = usePath();
	// TODO const nextStepPath = ;

	// TODO: work out appropriate tracks events

	return (
		<div className={ classnames( 'gutenboarding-page signup' ) }>
			<SignupForm />
		</div>
	);
};

export default Signup;
