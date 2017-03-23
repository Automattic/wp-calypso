function deterministStringify(source) {
    var namespace = [], keys;
    if (typeof source !== 'object') {
        if (typeof source === 'undefined') {
            return 'undefined';
        }
        if (typeof source === 'string') {
            return "'" + source.toString() + "'";
        }
        return source.toString();
    }
    if (Array.isArray(source)) {
        source = source.sort();
        source.forEach(function(item) {
            namespace.push(deterministStringify(item));
        });
        return namespace.join(',');
    }
    if (source === null) {
        return 'null';
    }

    keys = Object.keys(source);
    keys.sort();
    keys.forEach(function(key) {
        namespace.push(key + '=' + deterministStringify(source[key]));
    });
    return namespace.join('&');
}

module.exports = deterministStringify;
