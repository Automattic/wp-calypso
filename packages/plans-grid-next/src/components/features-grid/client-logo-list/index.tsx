import clsx from 'clsx';
import CLIENT_LIST from './client-list';
import './style.scss';

interface ClientLogoListProps extends React.HTMLAttributes< HTMLDivElement > {
	slugs?: string[];
}

const ClientLogoList = ( props: ClientLogoListProps ) => {
	const { className, slugs, ...otherProps } = props;

	const logos = slugs
		? slugs.flatMap( ( slug ) => {
				const match = CLIENT_LIST.find( ( c ) => c.slug === slug );
				return match ? [ match ] : [];
		  } )
		: CLIENT_LIST;

	const elementProps: React.HTMLAttributes< HTMLDivElement > = {
		className: clsx( 'plans-grid-next-client-logo-list', className ),
		...otherProps,
	};

	return (
		<div { ...elementProps }>
			{ logos.map( ( { slug, name, Logo } ) => (
				<div key={ slug } className={ `plans-grid-next-client-logo-list__item is-name-${ slug }` }>
					<Logo title={ name } />
				</div>
			) ) }
		</div>
	);
};

export default ClientLogoList;
