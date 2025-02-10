import clsx from 'clsx';
import CLIENT_LIST from './client-list';
import './style.scss';

const ClientLogoList = ( props: React.HTMLAttributes< HTMLDivElement > ) => {
	const { className, ...otherProps } = props;

	const elementProps: React.HTMLAttributes< HTMLDivElement > = {
		className: clsx( 'plans-grid-next-client-logo-list', className ),
		...otherProps,
	};

	return (
		<div { ...elementProps }>
			{ CLIENT_LIST.map( ( { slug, name, Logo } ) => (
				<div key={ slug } className={ `plans-grid-next-client-logo-list__item is-name-${ slug }` }>
					<Logo title={ name } />
				</div>
			) ) }
		</div>
	);
};

export default ClientLogoList;
