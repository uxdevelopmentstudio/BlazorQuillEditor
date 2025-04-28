namespace SimpleBlog
{
    public class BlogPost
    {
        public Guid? Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string HtmlContent { get; set; } = string.Empty;
        public DateTime PublishDate { get; set; }
        public string Author { get; set; } = string.Empty;
    }
}
