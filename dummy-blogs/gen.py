import os


def gen(title, page_count):
    os.mkdir(title)

    with open(f'{title}/rss.xml', 'w') as rss:
        rss.write('<rss><channel>\n')
        rss.write(f'<title>{title}</title>\n')
        range_end = 21 if page_count > 1 else 11
        for i in range(1, range_end):
            rss.write(
                f'<item><title>post{i}</title><link>./post{i}</link></item>\n')
        rss.write('</channel></rss>\n')

    for page_num in range(1, page_count + 1):
        if page_num == 1:
            filename = f'{title}/index.html'
            page_title = title
        else:
            filename = f'{title}/page{page_num}.html'
            page_title = f'{title} - page {page_num}'

        with open(filename, 'w') as page:
            page.write('<html>\n')
            page.write('<head>\n')
            page.write(f'<title>{page_title}</title>\n')
            page.write(
                f'<link rel="alternate" type="application/rss+xml" href="./rss.xml" title="{title}"></link>\n')
            page.write('</head>\n')
            page.write('<body>\n')

            page.write('<div>\n')
            for post_rel_num in range(1, 11):
                post_num = (page_num - 1) * 10 + post_rel_num
                page.write(
                    f'<div><a href="./post{post_num}">post{post_num}</a></div>\n')
            page.write('</div>\n')

            if page_num != page_count:
                page.write(f'<a href="./page{page_num + 1}.html">Next</a>\n')

            page.write('</body>\n')
            page.write('</html>\n')


def gen_fail(title):
    os.mkdir(title)

    with open(f'{title}/rss.xml', 'w') as rss:
        rss.write('<rss><channel>\n')
        rss.write(f'<title>{title}</title>\n')
        for i in range(1, 11):
            rss.write(
                f'<item><title>post{i}</title><link>./post{i}</link></item>\n')
        rss.write('</channel></rss>\n')

    with open(f'{title}/index.html', 'w') as page:
        page.write('<html>\n')
        page.write('<head>\n')
        page.write(f'<title>{title}</title>\n')
        page.write(
            f'<link rel="alternate" type="application/rss+xml" href="./rss.xml" title="{title}"></link>\n')
        page.write('</head>\n')
        page.write('<body></body>\n')
        page.write('</html>\n')
