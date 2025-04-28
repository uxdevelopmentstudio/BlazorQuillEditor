using System.Text.Json;

namespace SimpleBlog.Services
{
    public class BlogService
    {
        private readonly string _filePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Data", "blogposts.json");
        private List<BlogPost> _posts = [];

        public BlogService()
        {
            LoadPosts();
        }

        public List<BlogPost> GetPosts()
        {
            return _posts.OrderByDescending(p => p.PublishDate).ToList();
        }

        public void SavePost(BlogPost post)
        {
            BlogPost? oldPost = _posts.FirstOrDefault(x => x.Id == post.Id);
            if (oldPost != null)
            {
                _posts.Remove(oldPost);
            }

            _posts.Add(post);
            SavePosts();
        }

        private void SavePosts()
        {
            var directory = Path.GetDirectoryName(_filePath);
            if (!Directory.Exists(directory))
                Directory.CreateDirectory(directory);

            var json = JsonSerializer.Serialize(_posts);
            File.WriteAllText(_filePath, json);
        }

        private void LoadPosts()
        {
            if (File.Exists(_filePath))
            {
                var json = File.ReadAllText(_filePath);
                _posts = JsonSerializer.Deserialize<List<BlogPost>>(json) ?? new List<BlogPost>();
            }
        }
    }
}
