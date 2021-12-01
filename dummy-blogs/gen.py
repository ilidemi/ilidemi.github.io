def gen(path, page_count):
    with open(f'{path}/rss.xml', 'w') as rss:
        rss.write('<rss><channel>\n')
        for i in range(1, 21):
            rss.write(f'<item><title>post{i}</title><link>./post{i}</link></item>\n')
        rss.write('</channel></rss>\n')

    for page_num in range(1, page_count + 1):
        with open(f'{path}/page{page_num}.html', 'w') as page:
            page.write('<html>\n')
            page.write('<head><link rel="alternate" type="application/rss+xml" href="./rss.xml"></link></head>\n')
            page.write('<body>\n')

            page.write('<div>\n')
            for post_rel_num in range(1, 11):
                post_num = (page_num - 1) * 10 + post_rel_num
                page.write(f'<div><a href="./post{post_num}">post{post_num}</a></div>\n')
            page.write('</div>\n')
            
            if page_num != page_count:
                page.write(f'<a href="./page{page_num + 1}.html">Next</a>\n')

            page.write('</body>\n')
            page.write('</html>\n')
