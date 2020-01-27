function startTyping() {
    var typoDOM = document.querySelectorAll(".type-writer");
    var codeParts = [".lang", ".marker", ".prog"];
    var code = {
        0: {
            ".lang": "mysql",
            ".marker": ">",
            ".prog": "select * from mysql.user;"
        },
        1: {
            ".lang": "api",
            ".marker": ">",
            ".prog": "{response:{code:201, status:'Created', data:{dbname:'test_db'}, msg:'DB Created'}}"
        },
    }
    if (typoDOM) {
        typoDOM.forEach((node, i) => {
            codeParts.forEach((part) => {
                var K = 0;
                typeWriter(node.querySelector(part), K, code[i][part]);
            });
        });
    }
}

function typeWriter(node, i, text) {
    function type() {
        if (i < text.length) {
            node.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, 500);
        }
    }
    type();
}

window.onload = () => {
    startTyping();
}