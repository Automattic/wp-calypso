import { __, sprintf } from '@wordpress/i18n';
import classnames from 'classnames';
import { times } from 'lodash';
import './style.scss';

interface Props {
	currentPage: number;
	numberOfPages: number;
	setCurrentPage: ( page: number ) => void;
	classes: string | Array< string >;
}

const PaginationControl: React.FunctionComponent< Props > = ( props ) => {
	const { currentPage, numberOfPages, setCurrentPage, classes } = props;
	const classNames = classnames( 'pagination-controls', classes );

	return (
		<ul className={ classNames } aria-label={ __( 'Guide controls' ) }>
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
		</ul>
	);
};

export default PaginationControl;
