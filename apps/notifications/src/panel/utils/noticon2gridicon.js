const iconMap = {
	'\uf814': 'mention',
	'\uf300': 'comment',
	'\uf801': 'add',
	'\uf455': 'info',
	'\uf470': 'lock',
	'\uf806': 'stats-alt',
	'\uf805': 'reblog',
	'\uf408': 'star',
	'\uf804': 'trophy',
	'\uf467': 'reply',
	'\uf414': 'warning',
	'\uf418': 'checkmark',
	'\uf447': 'cart',
};

const noticon2gridicon = ( c ) => iconMap[ c ] ?? 'info';

export default noticon2gridicon;
