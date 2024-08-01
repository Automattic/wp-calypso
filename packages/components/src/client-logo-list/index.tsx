import clsx from 'clsx';
import CLIENT_LIST from './client-list';
import './style.scss';

const ClientLogoList = ( { className = '', ...otherProps } ) => {
	const props = {
		className: clsx( 'client-logo-list', className ),
		...otherProps,
		role: 'presentation',
		'aria-hidden': 'true',
	};

	return (
		<div { ...props }>
			{ CLIENT_LIST.map( ( { slug, name, Logo } ) => (
				<div
					key={ slug }
					className={ `client-logo-list__item client-logo-list__item--name-${ slug }` }
					title={ name }
				>
					<Logo />
				</div>
			) ) }
		</div>
	);
};

export default ClientLogoList;
