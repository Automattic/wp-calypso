import clsx from 'clsx';
import WordPressLogo from 'calypso/components/wordpress-logo';
import './style.scss';

const StepperLoader = () => {
	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return <WordPressLogo size={ 72 } className={ clsx( 'wpcom-site__logo', 'stepper-loader' ) } />;
};

export default StepperLoader;
