import { Button, Gridicon } from '@automattic/components';
import classnames from 'classnames';
import WordPressLogo from './wordpress-logo';

import './style.scss';

interface Props {
	shouldShowLoadingScreen: boolean;
	isReskinned: boolean;
	navigation?: any;
}

const SignupHeader: React.FunctionComponent< Props > = ( {
	isReskinned,
	shouldShowLoadingScreen,
	navigation,
} ) => {
	const { goNext, goBack, isHidden } = navigation;

	const logoClasses = classnames( 'wordpress-logo', {
		'is-large': shouldShowLoadingScreen && ! isReskinned,
	} );
	return (
		<div className="signup-header">
			<WordPressLogo size={ 24 } className={ logoClasses } />
			{ ! isHidden && (
				<div className="signup-header__navigation">
					<Button primary borderless onClick={ goBack } className="signup-header__left">
						<Gridicon icon={ 'chevron-left' } size={ 18 } />
						Back
					</Button>
					<Button primary borderless onClick={ goNext } className="signup-header__right">
						Skip
						<Gridicon icon={ 'chevron-right' } size={ 18 } />
					</Button>
				</div>
			) }
		</div>
	);
};

export default SignupHeader;
