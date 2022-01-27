import { __, sprintf } from '@wordpress/i18n';
import classnames from 'classnames';
import { times } from 'lodash';
import './style.scss';

interface Buttons {
	previous: {
		onClick: () => () => void;
		label: string;
		icon?: string;
		fill?: string;
		style?: object;
	};
	next: {
		onClick: () => () => void;
		label: string;
		icon?: string;
		fill?: string;
		style?: object;
	};
	classNames?: string | string[];
}

interface Props {
	currentPage: number;
	numberOfPages: number;
	setCurrentPage: ( page: number ) => void;
	classNames?: string | string[];
	buttons?: Buttons;
}

const PaginationControl: React.FunctionComponent< Props > = ( props ) => {
	const { currentPage, numberOfPages, setCurrentPage, classNames, buttons } = props;
	const { previous, next } = buttons;

	const classes = classnames( 'pagination-controls', classNames?.toString()?.split( ',' ) );

	return (
		<ul className={ classes } aria-label={ __( 'Guide controls' ) }>
			{ times( numberOfPages, ( page ) => (
				<li key={ page } aria-current={ page === currentPage ? 'page' : undefined }>
					<button
						key={ page }
						className={ classnames( 'pagination-control__page', {
							'pagination-control__current': page === currentPage,
						} ) }
						disabled={ page === currentPage }
						aria-label={ sprintf(
							/* translators: 1: current page number 2: total number of pages */
							__( 'Page %1$d of %2$d' ),
							page + 1,
							numberOfPages
						) }
						onClick={ () => setCurrentPage( page ) }
					/>
				</li>
			) ) }
			{ buttons && (
				<>
					<li>
						<button onClick={ previous.onClick } className={ previous.classNames }>
							{ previous.icon }
							{ previous.label }
						</button>
					</li>
					<li>
						<button onClick={ next.onClick } className={ next.classNames }>
							{ next.label }
							{ next.icon }
						</button>
					</li>
				</>
			) }
		</ul>
	);
};

export default PaginationControl;
