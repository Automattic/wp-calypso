import classnames from 'classnames';
import './styles.scss';

export const TestComponent = () => {
	return <div className={ classnames( 'test' ) }>Test - Hello world.com</div>;
};
